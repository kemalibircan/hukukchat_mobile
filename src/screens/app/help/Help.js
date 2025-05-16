import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    TextInput, 
    KeyboardAvoidingView, 
    Platform,
    StatusBar,
    BackHandler,
    Modal
  } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import Ionicons from 'react-native-vector-icons/Ionicons';
  import { Flow } from 'react-native-animated-spinkit';
  import { ScrollView } from 'react-native-gesture-handler';
  import CheckBox from '@react-native-community/checkbox';
  import { WebView } from 'react-native-webview';
import { selectSignIn } from '../../../slices/authSlices';
import { blueColor, orangeColor } from '../../../statics/color';
import NoteSended from '../modals/Warnings/NoteSended';
import ServerErrorModal from '../modals/Warnings/ServerErrorModal';
import { toggleNoteSendedVisible, toggleServerErrorModalVisible } from '../../../slices/modalSlices';
  
  const Help = ({ navigation }) => {
    const selectUserToken = useSelector(selectSignIn);
    const [userData, setUserData] = useState();
    const dispatch = useDispatch();
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isDisclosureModalVisible, setIsDisclosureModalVisible] = useState(false);
  
    // Change status bar color when screen mounts
    useEffect(() => {
      StatusBar.setBackgroundColor('white');
      StatusBar.setBarStyle('dark-content');
  
      return () => {
        // Restore status bar to previous state if needed
      };
    }, []);
  
    const handleNoteChange = newNote => {
      setNote(newNote);
    };
  
    useEffect(() => {
      const backAction = () => {
        navigation.goBack();
        return true;
      };
  
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
  
      return () => backHandler.remove();
    }, [navigation]);
  
    const fetchUserDetails = () => {
      fetch('https://api.hukukchat.com/get_user_details/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${selectUserToken}`,
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
      });
    };
  
    useEffect(() => {
      fetchUserDetails();
    }, []);
  
    const handleFormSubmit = () => {
      try { 
        setLoading(true);
        fetch('https://api.hukukchat.com/handle-contact-form', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: userData.user_name,
            phone: "",
            email: userData.email,
            message: note
          })
        })
        .then(response => response.json())
        .then(data => {
          setLoading(false);
          if(data.message === "Email sent successfully"){
            dispatch(toggleNoteSendedVisible(true));
          }
          setNote('');
        });
      } catch (error) {
        dispatch(toggleServerErrorModalVisible(true));
      }
    };
  
    return (
      <>
        <NoteSended/>
        <ServerErrorModal/>
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}} edges={['top', 'right', 'left']}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : null} 
            enabled
          >
            <ScrollView>
              <View style={styles.containerTop}>
                <View style={styles.header}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Ionicons
                        name="arrow-back-outline"
                        color={blueColor}
                        size={35} />
                    </TouchableOpacity>
                    <Text style={styles.headerName}>Destek</Text>
                  </View>
                </View>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text
                  style={{
                    fontSize: 25,
                    color: blueColor,
                    fontWeight: '600',
                    marginBottom: 50,
                    marginTop: 25,
                  }}
                >
                  Destek Talebinizi Paylaşın
                </Text>
                <View style={{width: 350, height: 350, borderWidth: .3, borderColor: blueColor, borderRadius: 20, padding: 25}}>
                  <TextInput
                    value={note}
                    placeholderTextColor={'grey'}
                    onChangeText={handleNoteChange}
                    style={{
                      color: 'black',
                      fontSize: 20,
                      fontWeight: '700',
                      flex: 1,
                    }}
                    placeholder='Bir şeyler yazın...'
                    textAlign='left'
                    textAlignVertical='top'
                    multiline={true}
                  />
                </View>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    disabled={false}
                    value={isChecked}
                    onValueChange={(newValue) => setIsChecked(newValue)}
                    tintColors={{ true: blueColor, false: 'gray' }}
                  />
                  <TouchableOpacity 
                    style={{justifyContent: 'center', alignItems: 'center', display: 'flex'}} 
                    onPress={() => { setIsDisclosureModalVisible(true) }}
                  >
                    <Text style={{fontWeight: '600', color: 'black'}}>Aydınlatma metnini </Text>
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>okudum anladım</Text>
                </View>
                <TouchableOpacity
                  onPress={handleFormSubmit}
                  style={[
                    styles.submitButton,
                    { backgroundColor: note.length < 10 || !isChecked ? '#cccccc' : blueColor },
                  ]}
                  disabled={note.length < 10 || !isChecked}
                >
                  {loading ? (
                    <Flow color={orangeColor} size={30} />
                  ) : (
                    <Text style={{color: 'white', fontSize: 24}}>Gönder</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        <Modal
          visible={isDisclosureModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsDisclosureModalVisible(false)}
        >
          <View style={styles.disclosureModal}>
            <View style={styles.disclosureModalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDisclosureModalVisible(false)}
              >
                <Ionicons name="close" size={30} color={blueColor} />
              </TouchableOpacity>
              <WebView
                source={{ uri: 'https://www.hukukchat.com/aydinlatma-metni' }}
                style={styles.webView}
              />
            </View>
          </View>
        </Modal>
      </>
    );
  };
  
  export default Help;
  
  const styles = StyleSheet.create({
    containerBottom: {
      flex: 1
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingLeft: 30,
      width: '100%',
      marginTop: 10,
      marginBottom: 10,
    },
    checkboxLabel: {
      fontSize: 16,
      color: 'black',
    },
    disclosureModal: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    disclosureModalContent: {
      backgroundColor: 'white',
      height: '80%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    closeButton: {
      marginLeft: 10,
      borderRadius: 5,
      height: 50,
      width: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    containerTop: {
      height: 50, 
      alignItems: 'center', 
      width: '100%',
      marginTop: 10,
      paddingLeft: 10
    },
    header: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      height: 50,
      width: '100%',
      borderBottomWidth: 0.3,
      borderColor: 'white',
    },
    headerName: {
      fontWeight: '600', 
      fontSize: 22, 
      marginLeft: 5,
      color: blueColor
    },
    webView: {
      flex: 1,
    },
    submitButton: {
      marginTop: 25,
      backgroundColor: blueColor,
      width: 300,
      justifyContent: 'center',
      alignItems: 'center',
      height: 75,
      borderRadius: 12
    }
  });