import React, { useState } from "react";
import {
  Image,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar,
  Platform,
  ScrollView,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { orangeColor } from "../../statics/color";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Flow } from 'react-native-animated-spinkit';
import { useDispatch } from "react-redux";
import {
  toggleKVKKModalVisible,
  toggleMailAlreadyInUse,
  toggleServerErrorModalVisible,
  toggleUserCreated,
  toggleUserNameAlreadyInUseVisible
} from "../../slices/modalSlices";
import MailAlreadyInUse from "../app/modals/Warnings/MailAlreadyInUse";
import UserNameAlreadyInUse from "../app/modals/Warnings/UserNameAlreadyInUse";
import UserCreated from "../app/modals/Warnings/UserCreated";
import KVKKModal from "../app/modals/KVKKModal/KVKKModal";
import ServerErrorModal from "../app/modals/Warnings/ServerErrorModal";
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const Register = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const dispatch = useDispatch();

  const registerValidationSchema = Yup.object().shape({
    username: Yup.string().required('Kullanıcı adı gereklidir'),
    email: Yup.string().email('Geçerli bir email adresi girin').required('Email gereklidir'),
    password: Yup.string().min(6, 'Şifre en az 6 karakter olmalı').required('Şifre gereklidir'),
  });

  const handleRegister = (values) => {
    setLoading(true);

    fetch('https://api.hukukchat.com/create_user/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: values.username,
        email: values.email,
        password: values.password,
        parent_user_id: null
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.msg === "Kullanıcı başarıyla oluşturuldu, aktivasyon için lütfen e-postanızı kontrol edin!") {
          console.log(data.msg);
          setLoading(false);
          dispatch(toggleUserCreated(true));
        } 
        else if(data.message === "An error occurred: Bu e-posta adresi zaten kullanılıyor") {
          setLoading(false);
          dispatch(toggleMailAlreadyInUse(true));
        }
        else if(data.message === "An error occurred: Bu kullanıcı adı zaten alınmış") {
          dispatch(toggleUserNameAlreadyInUseVisible(true));
          setLoading(false);
        } else {
          dispatch(toggleServerErrorModalVisible(true));
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        dispatch(toggleServerErrorModalVisible(true));
        setLoading(false);
      });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === "ios" ? "padding" : null}
        enabled
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <ServerErrorModal />
          <MailAlreadyInUse />
          <UserNameAlreadyInUse />
          <KVKKModal />
          <UserCreated />
          
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Image
                style={styles.logo}
                source={require('../../icons/1.png')}
              />
              <Text style={styles.welcomeText}>Yeni Hesap Oluştur</Text>
              <Text style={styles.subText}>Hukuki asistan ile tanışmak için kaydolun</Text>
            </View>

            <Formik
              initialValues={{ username: '', password: '', email: '' }}
              onSubmit={(values, { resetForm }) => {
                handleRegister(values);
                resetForm();
              }}
              validationSchema={registerValidationSchema}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.formContainer}>
                  <View style={styles.inputWrapper}>
                    <View style={[
                      styles.inputContainer,
                      errors.username && touched.username ? styles.inputError : {}
                    ]}>
                      <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        placeholder="Kullanıcı Adı"
                        placeholderTextColor="#999"
                        style={styles.input}
                        onChangeText={handleChange('username')}
                        onBlur={handleBlur('username')}
                        value={values.username}
                      />
                    </View>
                    {errors.username && touched.username && 
                      <Text style={styles.errorText}>{errors.username}</Text>
                    }
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={[
                      styles.inputContainer,
                      errors.email && touched.email ? styles.inputError : {}
                    ]}>
                      <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        placeholder="E-posta Adresi"
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

                  <View style={styles.inputWrapper}>
                    <View style={[
                      styles.inputContainer,
                      errors.password && touched.password ? styles.inputError : {}
                    ]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        placeholder="Şifre"
                        placeholderTextColor="#999"
                        style={styles.input}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={secureTextEntry}
                      />
                      <TouchableOpacity 
                        style={styles.eyeIcon}
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      >
                        <Ionicons 
                          name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                          size={20} 
                          color="#666" 
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && touched.password && 
                      <Text style={styles.errorText}>{errors.password}</Text>
                    }
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={styles.registerButton}
                    disabled={loading}
                  >
                    {loading ? (
                      <Flow color="#FFFFFF" size={30} />
                    ) : (
                      <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.loginLinkText}>Giriş yapın</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.privacyContainer}>
                    <Text style={styles.privacyText}>Devam ederek </Text>
                    <TouchableOpacity
                      onPress={() => dispatch(toggleKVKKModalVisible(true))}
                    >
                      <Text style={styles.privacyLinkText}>Gizlilik Politikası</Text>
                    </TouchableOpacity>
                    <Text style={styles.privacyText}>'nı kabul etmiş olursunuz</Text>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Register;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  keyboardAvoidingView: {
    flex: 1
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 20
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  logo: {
    width: 180,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#192B53',
    marginBottom: 8
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10
  },
  formContainer: {
    width: '100%'
  },
  inputWrapper: {
    marginBottom: 20
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
  eyeIcon: {
    padding: 8
  },
  errorText: {
    color: '#FF5A5A',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  registerButton: {
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
    marginTop: 10,
    marginBottom: 20
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  loginText: {
    color: '#666',
    fontSize: 14
  },
  loginLinkText: {
    color: orangeColor,
    fontSize: 14,
    fontWeight: '600'
  },
  privacyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  privacyText: {
    color: '#666',
    fontSize: 13
  },
  privacyLinkText: {
    color: orangeColor,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 4
  }
});