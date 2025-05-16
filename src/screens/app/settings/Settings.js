import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions,
  BackHandler,
  Text,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { selectSignIn } from '../../../slices/authSlices';
import { blueColor } from '../../../statics/color';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const Settings = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [accVisible, setAccVisible] = useState(false);
  const [restVisible, setRestVisible] = useState(false);
  const selectUserToken = useSelector(selectSignIn);
  const [userData, setUserData] = useState();
  
  // Animated values for chevron rotations
  const [accSpinValue] = useState(new Animated.Value(0));
  const [restSpinValue] = useState(new Animated.Value(0));

  // Colors - matching FAQ screen colors
  const darkBlue = '#193353';
  const lightBlue = '#E6F0FB';
  const accentBlue = '#4A90E2';
  const darkText = '#1E3A5F';
  const lightText = '#6B7C93';
  const backgroundWhite = '#F9FBFD';

  useEffect(() => {
    // Change status bar color when component mounts
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(darkBlue);
    }
    StatusBar.setBarStyle('light-content');

    // Restore status bar color when component unmounts
    return () => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('white');
      }
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

  function formatDate(dateString) {
    const dateObject = new Date(dateString); 
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const formattedDate = `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()}`;
    return formattedDate;
  }

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
      console.log(data);  
      setUserData(data);
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
  }

  useEffect(() => {
    fetchUserDetails();
  }, []);
  
  const toggleAccVisible = () => {
    // Configure next LayoutAnimation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Animate the arrow rotation
    Animated.timing(accSpinValue, {
      toValue: accVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setAccVisible(!accVisible);
  };
  
  const toggleRestVisible = () => {
    // Configure next LayoutAnimation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Animate the arrow rotation
    Animated.timing(restSpinValue, {
      toValue: restVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setRestVisible(!restVisible);
  };
  
  // Interpolate the spinValue to a rotation
  const accSpin = accSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  const restSpin = restSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={darkBlue} barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: darkBlue }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesap Bilgileri</Text>
        <View style={{ width: 28 }} /> 
      </View>
      
      {/* Content */}
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: backgroundWhite }]} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.cardIcon}>
            <Ionicons name="person-circle-outline" size={36} color="white" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData ? userData.user_name : 'Yükleniyor...'}</Text>
            <Text style={styles.userEmail}>{userData ? userData.email : 'Yükleniyor...'}</Text>
          </View>
        </View>
        
        {/* Credit Badge */}
        <View style={styles.creditContainer}>
          <View style={styles.creditIcon}>
            <Ionicons name="wallet-outline" size={24} color={accentBlue} />
          </View>
          <View style={styles.creditInfo}>
            <Text style={styles.creditLabel}>Kalan Krediniz</Text>
            <Text style={styles.creditAmount}>{userData?.subscription?.credits || '0'}</Text>
          </View>
        </View>
        
        {/* Package Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Paket Bilgileri</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[
              styles.sectionCard,
              restVisible && { backgroundColor: lightBlue, borderRadius: 16 }
            ]}
            onPress={toggleRestVisible}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[
                  styles.iconCircle,
                  { backgroundColor: restVisible ? accentBlue : lightBlue }
                ]}>
                  <Ionicons 
                    name="cube-outline" 
                    size={20} 
                    color={restVisible ? 'white' : darkBlue} 
                  />
                </View>
                <Text style={styles.sectionHeaderText}>
                  {userData?.subscription?.plan || 'Yükleniyor...'}
                </Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: restSpin }] }}>
                <Ionicons 
                  name="chevron-down-outline" 
                  size={22} 
                  color={restVisible ? accentBlue : darkBlue} 
                />
              </Animated.View>
            </View>
            
            {restVisible && (
              <View style={styles.expandedContent}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-clear-outline" size={18} color={darkText} />
                  <Text style={styles.infoText}>
                    Başlangıç: {userData?.subscription?.start_date ? formatDate(userData.subscription.start_date) : ''}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color={darkText} />
                  <Text style={styles.infoText}>
                    Bitiş: {userData?.subscription?.end_date ? formatDate(userData.subscription.end_date) : ''}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="server-outline" size={18} color={darkText} />
                  <Text style={styles.infoText}>
                    Kalan Kredi: {userData?.subscription?.credits || '0'}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Account Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Üyelik Bilgileri</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[
              styles.sectionCard,
              accVisible && { backgroundColor: lightBlue, borderRadius: 16 }
            ]}
            onPress={toggleAccVisible}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[
                  styles.iconCircle,
                  { backgroundColor: accVisible ? accentBlue : lightBlue }
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={accVisible ? 'white' : darkBlue} 
                  />
                </View>
                <Text style={styles.sectionHeaderText}>
                  {userData?.user_name || 'Yükleniyor...'}
                </Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: accSpin }] }}>
                <Ionicons 
                  name="chevron-down-outline" 
                  size={22} 
                  color={accVisible ? accentBlue : darkBlue} 
                />
              </Animated.View>
            </View>
            
            {accVisible && (
              <View style={styles.expandedContent}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={18} color={darkText} />
                  <Text style={styles.infoText}>
                    Mail: {userData?.email || ''}
                  </Text>
                </View>
                
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Support & Help */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Destek</Text>
          <TouchableOpacity 
            style={styles.supportCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Help')}
          >
            <View style={styles.supportCardContent}>
              <View style={styles.supportLeft}>
                <View style={[styles.iconCircle, { backgroundColor: lightBlue }]}>
                  <Ionicons name="help-buoy-outline" size={20} color={darkBlue} />
                </View>
                <Text style={styles.supportText}>Yardım ve Destek</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={22} color={darkBlue} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.supportCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('FAQ')}
          >
            <View style={styles.supportCardContent}>
              <View style={styles.supportLeft}>
                <View style={[styles.iconCircle, { backgroundColor: lightBlue }]}>
                  <Ionicons name="information-circle-outline" size={20} color={darkBlue} />
                </View>
                <Text style={styles.supportText}>Sıkça Sorulan Sorular</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={22} color={darkBlue} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versiyon 1.0.5</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#193353',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  scrollView: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#193353',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  creditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  creditIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6F0FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditInfo: {
    marginLeft: 16,
  },
  creditLabel: {
    fontSize: 14,
    color: '#6B7C93',
    marginBottom: 4,
  },
  creditAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#193353',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#193353',
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#193353',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#1E3A5F',
  },
  supportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  supportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#193353',
    marginLeft: 14,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#6B7C93',
  },
});

export default Settings;