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
import ServerErrorModal from "../app/modals/Warnings/ServerErrorModal";
import { Flow } from 'react-native-animated-spinkit';
import { useDispatch } from "react-redux";
import { toggleServerErrorModalVisible, toggleWarningFuncVisible } from "../../slices/modalSlices";
import Ionicons from 'react-native-vector-icons/Ionicons';
import WarningFunc from "../app/modals/Warnings/WarningFunc";

const ResetPassword = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("");

  const resetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Geçerli bir email adresi girin')
      .required('Email gereklidir'),
  });

  const handleResetPassword = (values) => {
    setLoading(true);
    
    fetch('https://api.hukukchat.com/password_reset_request/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: values.email
      })
    })
    .then(response => response.json())
    .then(data => {
      if(data.message == "An error occurred: Kullanıcı bulunamadı") {
        setMessage("Böyle bir kullanıcı bulunamadı!");
        setButtonText("Tekrar Dene");
        dispatch(toggleWarningFuncVisible(true));
      }
      else if(data.msg == "Şifre sıfırlama bağlantısı gönderildi!") {
        setMessage("Şifre sıfırlama bağlantısı mail adresinize gönderilmiştir!");
        setButtonText("Tamamla");
        dispatch(toggleWarningFuncVisible(true));
      }
      else {
        dispatch(toggleServerErrorModalVisible(true));
      }
    })
    .catch(error => {
      console.error('Hata:', error);
      dispatch(toggleServerErrorModalVisible(true));
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === "ios" ? "padding" : null} 
        enabled
      >
        <ServerErrorModal />
        <WarningFunc message={message} button={buttonText} />
        
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="arrow-back" size={24} color="#192B53" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Şifremi Unuttum</Text>
              <Text style={styles.subtitle}>
                Kayıtlı e-posta adresinizi girerek şifre sıfırlama bağlantısı alabilirsiniz
              </Text>
            </View>
          </View>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={resetPasswordSchema}
            onSubmit={values => handleResetPassword(values)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <View style={[
                    styles.inputContainer,
                    errors.email && touched.email ? styles.inputError : {}
                  ]}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="E-posta"
                      placeholderTextColor="#999"
                      style={styles.input}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && touched.email && 
                    <Text style={styles.errorText}>{errors.email}</Text>
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
                    <Text style={styles.submitButtonText}>Sıfırlama Bağlantısı Gönder</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.loginLinkContainer}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Ionicons name="arrow-back" size={16} color={orangeColor} style={styles.loginIcon} />
                  <Text style={styles.loginLinkText}>Giriş sayfasına dön</Text>
                </TouchableOpacity>
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16
  },
  loginIcon: {
    marginRight: 6
  },
  loginLinkText: {
    color: orangeColor,
    fontSize: 14,
    fontWeight: '600'
  }
});

export default ResetPassword;