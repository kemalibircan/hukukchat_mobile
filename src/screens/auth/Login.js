import React, { useState } from "react";
import { 
  Image, 
  View, 
  Text, 
  KeyboardAvoidingView, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Platform,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { orangeColor } from "../../statics/color";
import { Formik } from 'formik';
import * as Yup from 'yup';
import WrongPassOrMailModal from "../app/modals/Warnings/WrongPassOrMailModal";
import ServerErrorModal from "../app/modals/Warnings/ServerErrorModal";
import { Flow } from 'react-native-animated-spinkit';
import { useDispatch } from "react-redux";
import { toggleServerErrorModalVisible, toggleWrongPassOrMailModalVisible } from "../../slices/modalSlices";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSignIn } from "../../slices/authSlices";
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const dispatch = useDispatch();

  const loginValidationSchema = Yup.object().shape({
    username: Yup.string().required('Kullanıcı adı gereklidir'),
    password: Yup.string().min(6, 'Şifre en az 6 karakter olmalı').required('Şifre gereklidir'),
  });

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('jwt', value);
      dispatch(setSignIn(value))
    } catch (e) {
      console.log(value)
    }
  }

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      await fetch('https://api.hukukchat.com/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      }).then(response => response.json())
        .then(data => {
          console.log(data)
          if (data.message === "An error occurred: Yanlış kullanıcı adı ya da parola") {
            dispatch(toggleWrongPassOrMailModalVisible(true))
          }
          else if (data.token_type == "bearer") {
            storeData(data.access_token)
          }
          else {
            dispatch(toggleServerErrorModalVisible(true))
          }
        })
    } catch (error) {
      console.error('Fetch Error:', error);
      dispatch(toggleServerErrorModalVisible(true))
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === "ios" ? "padding" : null} 
        enabled
      >
        <WrongPassOrMailModal />
        <ServerErrorModal />
        
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Image
              style={styles.logo}
              source={require('../../icons/1.png')}
            />
            <Text style={styles.welcomeText}>Hesabınıza Giriş Yapın</Text>
            <Text style={styles.subText}>Hukuki işlerinizi kolaylaştırmak için hemen giriş yapın</Text>
          </View>

          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={loginValidationSchema}
            onSubmit={values => handleLogin(values)}
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
                  style={styles.forgotPasswordButton}
                  onPress={() => navigation.navigate('ResetPassword')}
                >
                  <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.loginButton}
                  disabled={loading}
                >
                  {loading ? (
                    <Flow color="#FFFFFF" size={30} />
                  ) : (
                    <Text style={styles.loginButtonText}>Giriş Yap</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Hesabınız yok mu? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLinkText}>Hemen kaydolun</Text>
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

export default Login;

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
    justifyContent: 'center'
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 30
  },
  forgotPasswordText: {
    color: orangeColor,
    fontSize: 14,
    fontWeight: '500'
  },
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  registerText: {
    color: '#666',
    fontSize: 14
  },
  registerLinkText: {
    color: orangeColor,
    fontSize: 14,
    fontWeight: '600'
  }
});