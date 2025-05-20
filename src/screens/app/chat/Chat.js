import React, {useState, useEffect, useRef} from 'react';
import {
  Button,
  FlatList,
  Image,
  ProgressViewIOSBase,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
  AppState,
  Keyboard,
  Switch,
} from 'react-native';

import EventSource, {EventSourceListener} from 'react-native-sse';
import 'react-native-url-polyfill/auto';
import { MenuProvider } from 'react-native-popup-menu';

import ChatItem from './ChatItem';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatScreenMenuModal from '../modals/menuModals/ChatScreenMenuModal';
import {useDispatch, useSelector} from 'react-redux';
import Showdown from 'react-native-showdown';

import {
  selectCounter,
  selectIsChatHistoryModalVisible,
  selectIsWarningFuncVisible,
  setCounter,
  toggleChatHistoryModalVisible,
  toggleChatScreenMenuVisible,
  toggleChatSeetingsModalVisible,
  toggleHelpModalVisible,
  toggleLoginAgainModalVisible,
  toggleSSSModalVisible,
  toggleServerErrorModalVisible,
  toggleWarningFuncVisible,
  togglePaymentModalVisible,
  toggleCreditModal,

} from '../../../slices/modalSlices';
import {Swing} from 'react-native-animated-spinkit';
import {blueColor, greyColor, orangeColor} from '../../../statics/color';
import {selectSignIn} from '../../../slices/authSlices';
import ServerErrorModal from '../modals/Warnings/ServerErrorModal';
import {selectUserName} from '../../../slices/userSlices';
import WarningFunc from '../modals/Warnings/WarningFunc';
import ChatHistoryModal from '../modals/ChatHistoryModal/ChatHistoryModal';
import {
  selectChatHistory,
  selectSessionToken,
  selectWarningButtonText,
  selectWarningText,
  selectWebSearchEnabled,
  setChatHistory,
  setSessionToken,
  
} from '../../../slices/chatSlices';
import LoginAgainModal from '../modals/Warnings/LoginAgainModal';
import ChatSettingsModal from '../modals/ChatSetttingsModal/ChatSettingsModal';
import HelpModal from '../modals/HelpModal/HelpModal';
import SSSModal from '../modals/SSSModal/SSSModal';
import CreditModal from '../modals/CreditModal/CreditModal';
import ChatInputComponent from './ChatInputComponent';

const Chat = ({navigation}) => {
  const [req, setReq] = useState('');
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const [messageWaiting, setMessageWaiting] = useState(false);
  const selectUserToken = useSelector(selectSignIn);
  const [message, setMessage] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [userData, setUserData] = useState();
  const [textId, setTextId] = useState(0);
  const [sendButtonDisabled, setSendButtonDisabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [editButtonDisable, setEdditButtonDisable] = useState(true);
  const [session_id, set_session_id] = useState('');
  const [userDataOneTime, setUserDataOneTime] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isWebSearchEnabledOneTime, setIsWebSearchEnabledOneTime] = useState(false)
  const [dataLenghtMoreOne, setDataLenghtMoreOne] = useState(true);
    useState(false);
  let counter = useSelector(selectCounter);
  let sessionToken = useSelector(selectSessionToken);

  const warningText = useSelector(selectWarningText);
  const warningButtonText = useSelector(selectWarningButtonText);
  const [data, setData] = useState([
    {
      title: 'Merhabalar ben HukukChat size nasıl yardımcı olabilirim?null',
      owner: 'Ai',
      index: index,
    },
  ]);
  const selectUserId = useSelector(selectUserName);
  const dataFromChatHistory = useSelector(selectChatHistory);
  let selectChatHistoryVisible = useSelector(selectIsChatHistoryModalVisible);

  useEffect(() => {
    if (data.length > 1) {
      setEdditButtonDisable(false);
      setIsWebSearchEnabledOneTime(false);
      setDataLenghtMoreOne(false);
    } else {
      setEdditButtonDisable(true);
      setDataLenghtMoreOne(true);
      setIsWebSearchEnabledOneTime(true);
    }
  }, [data]);
  const from_chat_history = dataFromChatHistory => {
    const inputData = [dataFromChatHistory];

    // Eğer inputData boşsa veya bir array değilse, bir uyarı mesajı yazdır
    if (!Array.isArray(inputData) || inputData.length === 0) {
      console.log('Girdi verisi boş veya geçersiz.');
      return;
    }

    // Dönüştürülen veriyi saklamak için boş bir liste oluşturun
    let outputData = [];

    // Mesajları takip etmek için bir index sayacı oluşturun
    let indexCounter = 0;

    // Veriyi işlemek
    inputData.forEach(session => {
      // Oturumun undefined olup olmadığını kontrol et
      if (session === undefined) {
        console.log('Oturum verisi undefined.');
        return;
      }

      // Kullanıcı ve asistan mesajlarını ayrı listelere ekleyin
      let userMessages = [];
      let assistantMessages = [];

      // Kullanıcı mesajlarının var olup olmadığını kontrol et ve ekle
      if (session.user_messages && session.user_messages.length > 0) {
        session.user_messages.forEach(userMessage => {
          userMessages.push({
            index: indexCounter,
            owner: 'me',
            title: userMessage,
          });
          indexCounter++;
        });
      }

      // Asistan mesajlarının var olup olmadığını kontrol et ve ekle
      if (session.assistant_messages && session.assistant_messages.length > 0) {
        session.assistant_messages.forEach(assistantMessage => {
          assistantMessages.push({
            index: indexCounter,
            owner: 'Ai',
            title: assistantMessage,
          });
          indexCounter++;
        });
      }

      // Kullanıcı ve asistan mesajlarını dönüşümlü olarak outputData'ya ekle
      const maxLength = Math.max(userMessages.length, assistantMessages.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < userMessages.length) {
          outputData.push(userMessages[i]);
        }
        if (i < assistantMessages.length) {
          outputData.push(assistantMessages[i]);
        }
      }
    });

    if (outputData.length > 0) {
      setData(outputData);
    }
  };

  useEffect(() => {
    if (dataFromChatHistory && dataFromChatHistory.session_id != undefined) {
      from_chat_history(dataFromChatHistory);
      set_session_id(dataFromChatHistory.session_id);
    }
  }, [counter]);

  useEffect(() => {
    if (userData) {
      handleResetChatHistory();
    }
  }, []);

  const flatListRef = useRef(null); // Ref'i tanımla

  // Diğer kodlar...

  useEffect(() => {
    // FlatList'e her güncelleme yapıldığında en altına kaydır
    flatListRef.current.scrollToEnd({animated: true});
  }, [data]); // data state'i değiştiğinde useEffect'i tetikle

  let accumulatedData = ''; // Accumulate chunks into a single string

  const fetchSubscriptionPlans = () => {
    fetch('https://api.hukukchat.com/get_user_details/', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${selectUserToken}`,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {

        setUserData(data);
        console.log(data);
        setUserDataOneTime(true);
      })
      .catch(error => {});
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    if (userData) {
      const updateSession = async () => {
        const url = 'https://api.hukukchat.com/update_session/';
        const headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };

        const body = JSON.stringify({
          session_id: session_id,
          user_id: userData.user_name,
        });

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
          });

          const data = await response.json();
        } catch (error) {}
      };
      updateSession();
    }
  }, [session_id]);

  useEffect(() => {
    if (userData) {
      if (userData.subscription.credits <= 1) {
        setMessage('Krediniz tükendi lütfen bir plan seçip kredi yükleyiniz!');
        setButtonText('Tamam');
        setSendButtonDisabled(true);
        dispatch(toggleWarningFuncVisible(true));
      }
    }
  }, [userData]);

  useEffect(() => {
    setMessage(warningText);
    setButtonText(warningButtonText);
  }, [warningText, warningButtonText, selectIsWarningFuncVisible]);

  const updateDataAtLastIndex = newData => {
    setData(prevData => {
      // Eğer veri dizisi boşsa, hiçbir güncelleme yapma
      if (prevData.length === 0) {
        return prevData;
      }
      // Önceki veri dizisinin bir kopyasını oluştur
      const updatedData = [...prevData];
      // Son indeksi al
      const lastIndex = updatedData.length - 1;
      // Son indeksteki veriyi güncelle
      updatedData[lastIndex] = newData;
      // Güncellenmiş veriyi state'e kaydet
      return updatedData;
    });
  };

  useEffect(() => {
    handleResetChatHistory();
  }, [userDataOneTime]);
  const handleResetChatHistory = () => {
    if (userData) {
      fetch('https://api.hukukchat.com/reset_session/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_name,
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.status === 'success') {
            dispatch(setSessionToken(''));
            set_session_id('');
            setData([
              {
                title:
                  'Merhabalar ben HukukChat size nasıl yardımcı olabilirim?null',
                owner: 'Ai',
                index: index,
              },
            ]);
          } else {
            dispatch(toggleServerErrorModalVisible(true));
          }
        })
        .catch(error => {
          console.log('Hata:', error);
          dispatch(toggleServerErrorModalVisible(true));
          setData([
            {
              title:
                'Merhabalar ben HukukChat size nasıl yardımcı olabilirim?null',
              owner: 'Ai',
              index: index, 
            },
          ]);
        });
    }
  };

  useEffect(() => {
    if (req.trim().length === 0) {
      setSendButtonDisabled(false);
    } else {
      setSendButtonDisabled(false);
    }
  }, [req]);

  const sendWithWebSearch = (messageText) => {
    setSendButtonDisabled(true);
    fetchSubscriptionPlans();
    const myrequest = {title: messageText, owner: 'me'};
    setReq('');
    setData(prevData => [...prevData, myrequest]);

    const loading = {
      title: 'loading',
      owner: 'Ai',
      index: index + 1,
    };
    setData(prevData => [...prevData, loading]);
    Keyboard.dismiss();
    flatListRef.current.scrollToEnd({animated: true});

    fetch('https://api.hukukchat.com/web_arama', {
      headers: {
        Authorization: `Bearer ${selectUserToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageText,
      }),
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        accumulatedData += data.summary;
        const newChatItem = {
          title: accumulatedData,
          owner: 'Ai',
          index: index + 1,
        };

        accumulatedData = '';
        setMessageWaiting(false);
        setSendButtonDisabled(false);

        updateDataAtLastIndex(newChatItem);
      })
      .catch(error => {
        setMessageWaiting(false);
        dispatch(toggleServerErrorModalVisible(true));
        setSendButtonDisabled(false);
      });
  };
  const handleSendMessage = (messageText) => {
    setSendButtonDisabled(true);
    fetchSubscriptionPlans();
    const myrequest = {title: messageText, owner: 'me'};
    setReq('');
    setData(prevData => [...prevData, myrequest]);

    const loading = {
      title: 'loading',
      owner: 'Ai',
      index: index + 1,
    };
    setData(prevData => [...prevData, loading]);

    Keyboard.dismiss();
    flatListRef.current.scrollToEnd({animated: true});

    const eventSource = new EventSource(
      'https://api.hukukchat.com/generate_mobile_response/',
      {
        headers: {
          Authorization: `Bearer ${selectUserToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_question: messageText,
          selected_model: 'gpt-4',
          selected_law_area: 'Genel Hukuk',
          session_id: session_id,
        }),
        method: 'POST',
      },
    );

    eventSource.addEventListener('message', event => {
      try {
        const chunk = JSON.parse(event.data);
        accumulatedData += chunk.text;
        const newChatItem = {
          title: accumulatedData,
          owner: 'Ai',
          index: index + 1,
        };
        if (chunk.text === null) {
          accumulatedData = '';
          setMessageWaiting(false);
          setSendButtonDisabled(false);
          return eventSource.close();
        }

        updateDataAtLastIndex(newChatItem);
      } catch (error) {
        setMessageWaiting(false);
        dispatch(toggleServerErrorModalVisible(true));
        setSendButtonDisabled(false);
        return eventSource.close();
      }
    });

    eventSource.addEventListener('error', event => {
      let errorMessage = JSON.parse(event.message);
      if (
        errorMessage.message ===
        'An error occurred: Doğrulama süresi doldu. Lütfen tekrar giriş yapın.'
      ) {
        console.log(errorMessage.message);
        setMessageWaiting(false);
        dispatch(toggleLoginAgainModalVisible(true));
        setSendButtonDisabled(false);
        return eventSource.close();
      } else if (event.type === 'error') {
        setMessageWaiting(false);
        dispatch(toggleServerErrorModalVisible(true));
        setSendButtonDisabled(false);
        return eventSource.close();
      } else if (event.type === 'exception') {
        setMessageWaiting(false);
        setSendButtonDisabled(false);
        return eventSource.close();
      }
    });

    return () => {
      eventSource.close();
    };
  };

  const renderItem = ({item, index}) => {

    return (
      <MenuProvider>
        <ChatItem item={item} index={index}></ChatItem>
</MenuProvider>
    )
  };
  const handleNewChat = () => {
    handleResetChatHistory();
  };
  const handleToggleSwitch = () => {
    const newValue = !isWebSearchEnabled;
    setIsWebSearchEnabled(newValue);
  };

  return (
    <SafeAreaView style={{ flex: 1, margin: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled>
        {/* All your modals */}
        <ChatHistoryModal />
        <ChatSettingsModal />
        <HelpModal />
        <ChatScreenMenuModal />
        <ServerErrorModal />
        <LoginAgainModal />
        <SSSModal />
        <CreditModal />

        <StatusBar
          backgroundColor={'white'}
          barStyle={'dark-content'}
        />

        <WarningFunc message={message} button={buttonText} />
        
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {/* Updated Header Design */}
          <View style={styles.headerContainer}>
            <View style={styles.headerLeftContainer}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => {
                  dispatch(toggleChatHistoryModalVisible(true));
                  dispatch(setCounter(counter + 1));
                  dispatch(setChatHistory(data));
                }}>
                <Ionicons name="albums-outline" size={24} color={orangeColor} />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>HukukChat</Text>
            </View>
            
            <View style={styles.headerRightContainer}>
              <TouchableOpacity 
                style={styles.newChatButton}
                onPress={handleNewChat}>
                <Ionicons name="create-outline" size={22} color={'white'} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  navigation.navigate('Menu');

}}>
                <Ionicons name="menu-outline" size={24} color={blueColor} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <FlatList
              ref={flatListRef}
              data={data}
              renderItem={renderItem}
              style={styles.flatListContainer}
              extraData={data}
            />

            {/* Toggle for Web Search - Only shown when needed */}
            {isWebSearchEnabledOneTime && (
              <View style={styles.webSearchToggleContainer}>
                {/* Your existing web search toggle code */}
              </View>
            )}

            {/* Input Component */}

        <ChatInputComponent 
          onSendMessage={isWebSearchEnabled ? sendWithWebSearch : handleSendMessage}
          onWebSearchToggle={handleToggleSwitch}
          isWebSearchEnabled={isWebSearchEnabled}
          disabled={sendButtonDisabled}
          navigation={navigation}
        />
            
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Model: GPT 4.0 | Hukuk Alanı: Genel Hukuk. Oluşturulan içerik
                hatalı veya eksikse lütfen bize bildirin.
              </Text>
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() => {
                  navigation.navigate('Help');
                }}>
                <Ionicons name="share-outline" size={22} color={'grey'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: blueColor,
    marginLeft: 12,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  historyButton: {
    padding: 4,
  },
  newChatButton: {
    backgroundColor: blueColor,
    borderRadius: 16,
    padding: 6,
    marginRight: 10,
  },
  menuButton: {
    padding: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  flatListContainer: {
    flex: 1,
    width: '100%',
  },
  webSearchToggleContainer: {
    height: 40,
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  footerContainer: {
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  footerText: {
    color: 'grey',
    fontSize: 12,
    flex: 1,
  },
  helpButton: {
    marginLeft: 5,
  },
});