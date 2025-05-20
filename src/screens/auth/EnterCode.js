import React, { useState } from "react";
import { 
  View, 
  Text, 
  KeyboardAvoidingView, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { orangeColor } from "../../statics/color";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Flow } from 'react-native-animated-spinkit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from '../../functions/Toast'; // Import the Toast component

const EnterCode = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info"
  });

  const codeValidationSchema = Yup.object().shape({
    code: Yup.string()
      .matches(/^\d{3}-\d{3}$/, 'Kod formatı: 123-456 şeklinde olmalıdır')
      .required('Doğrulama kodu gereklidir'),
  });

  const handleSubmitCode = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        // Success scenario
        if (values.code === "123-456") {
          navigation.navigate('ResetPasswordConfirm'); // Navigate to password reset page
        } 
        // Error scenario
        else {
          setToast({
            visible: true,
            message: "Geçersiz doğrulama kodu. Lütfen kontrol edip tekrar deneyin.",
            type: "error"
          });
        }
        setLoading(false);
      }, 1500);
    } catch (error) {
      setToast({
        visible: true,
        message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        type: "error"
      });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === "ios" ? "padding" : null} 
        enabled
      >
        <Toast 
          visible={toast.visible} 
          message={toast.message} 
          type={toast.type} 
          onDismiss={() => setToast({...toast, visible: false})} 
        />
        
        <View style={styles.container}>
          {/* Header section */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <Ionicons name="arrow-back" size={24} color="#192B53" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Doğrulama Kodu</Text>
              <Text style={styles.subtitle}>E-posta adresinize gönderilen 6 haneli doğrulama kodunu giriniz</Text>
            </View>
          </View>

          {/* Form section */}
          <Formik
            initialValues={{ code: '' }}
            validationSchema={codeValidationSchema}
            onSubmit={values => handleSubmitCode(values)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    errors.code && touched.code ? styles.inputError : {}
                  ]}>
                    <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Örnek: 123-456"
                      placeholderTextColor="#999"
                      style={styles.input}
                      onChangeText={handleChange('code')}
                      onBlur={handleBlur('code')}
                      value={values.code}
                      keyboardType="number-pad"
                    />
                  </View>
                  {errors.code && touched.code && 
                    <Text style={styles.errorText}>{errors.code}</Text>
                  }
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? (
                    <Flow color="#FFFFFF" size={30} />
                  ) : (
                    <Text style={styles.submitButtonText}>Doğrula</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Kod almadınız mı? </Text>
                  <TouchableOpacity onPress={() => {
                    setToast({
                      visible: true,
                      message: "Yeni doğrulama kodu gönderildi",
                      type: "success"
                    });
                  }}>
                    <Text style={styles.resendLinkText}>Yeniden gönder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  keyboardAvoidingView: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 20
  },
  headerContainer: {
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  titleContainer: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#192B53',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  formContainer: {
    width: '100%'
  },
  inputWrapper: {
    marginBottom: 30
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E6ED'
  },
  inputError: {
    borderColor: '#FF5A5A'
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16
  },
  errorText: {
    color: '#FF5A5A',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  submitButton: {
    backgroundColor: orangeColor,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: orangeColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  resendText: {
    color: '#666',
    fontSize: 14
  },
  resendLinkText: {
    color: orangeColor,
    fontSize: 14,
    fontWeight: '600'
  }
});

export default EnterCode;