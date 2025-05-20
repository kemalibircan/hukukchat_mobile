import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { selectIconId, setUserName } from '../../../slices/userSlices';
import { selectCounter } from '../../../slices/modalSlices';
import { selectSignIn, setSignIn } from '../../../slices/authSlices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../../../functions/Toast';

const { width } = Dimensions.get('window');

const MenuScreen = () => {
  const navigation = useNavigation();
  const selectUserToken = useSelector(selectSignIn);
  const counter = useSelector(selectCounter);
  const dispatch = useDispatch();
  
  const [userData, setUserData] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  
  // Feature descriptions for info buttons
  const featureDescriptions = {
    "Hukuki Asistan": "Yapay zeka destekli hukuki asistan ile sorularınıza anında cevap alın. Belgelerinizi analiz edin ve hukuki öneriler alın.",
    "İçtihat Ara": "Türkiye'deki yüksek mahkeme kararlarını ve içtihatları arayın, inceleyin ve çalışmalarınızda kullanın.",
    "Mevzuat Ara": "Kanun, yönetmelik ve tüm mevzuat içeriklerinde detaylı arama yapın ve güncel düzenlemeleri takip edin.",
    "Hukuki Çeviri": "Hukuki belgeleri, kararları ve metinleri farklı dillere çevirin ve terminolojik doğruluğu sağlayın.",
    "Belge İncele": "Hukuki belgelerinizi yükleyin, analiz edin ve içeriklerini yapay zeka ile değerlendirin.",
    "Hesaplamalar": "Tazminat, faiz ve diğer hukuki hesaplamaları hızlı ve güvenilir şekilde yapın."
  };

  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const fetchUserDetails = async () => {
    // First check for internet connectivity
    
    try {
      const response = await fetch('https://api.hukukchat.com/get_user_details/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${selectUserToken}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        dispatch(setUserName(data.user_name));
      } else if (response.status === 401) {
        // Unauthorized, token expired
        showToast('Oturum süresi doldu. Lütfen tekrar giriş yapın.', 'warning');
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        throw new Error(`Sunucu hatası: ${response.status}`);
      }
    } catch (error) {
      console.error('There was a problem with your fetch operation:', error);
      
      // Check if it's a network error
      if (error.message.includes('Network request failed') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network error')) {
        showToast('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.', 'error');
      } else {
        // Other types of errors
        showToast('Bir hata oluştu: ' + error.message, 'error');
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [counter]);

  const handleInfoPress = (featureTitle) => {
    Alert.alert(
      featureTitle,
      featureDescriptions[featureTitle],
      [{ text: 'Anladım', style: 'default' }]
    );
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwt');
      dispatch(setSignIn(null));
      console.log('Başarıyla çıkış yapıldı');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
      showToast('Çıkış yapılırken bir hata oluştu', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle='light-content' />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Merhaba,</Text>
          <Text style={styles.userName}>{userData ? userData.user_name : 'Kullanıcı'}</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#193353" />
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.userCard}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle-outline" size={36} color="#193353" />
            <View style={styles.userTextContainer}>
              <Text style={styles.emailText}>{userData ? userData.email : 'Yükleniyor...'}</Text>
              {userData && userData.subscription && (
                <Text style={styles.planText}>{userData.subscription.plan}</Text>
              )}
            </View>
          </View>
          
          {userData && userData.subscription && (
            <View style={styles.creditsBadge}>
              <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
              <Text style={styles.creditsText}>{userData.subscription.credits}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hukuki Servisler</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard
              title="Hukuki Asistan"
              icon="chatbubbles-outline"
              onPress={() => navigation.navigate('Chat')}
              onInfoPress={() => handleInfoPress("Hukuki Asistan")}
            />
            
            <FeatureCard
              title="İçtihat Ara"
              icon="document-text-outline"
              onPress={() => navigation.navigate('Ictihat')}
              onInfoPress={() => handleInfoPress("İçtihat Ara")}
            />

            <FeatureCard
              title="Mevzuat Ara"
              icon="search-outline"
              onPress={() => navigation.navigate('Mevzuat')}
              onInfoPress={() => handleInfoPress("Mevzuat Ara")}
            />

            <FeatureCard
              title="Hukuki Çeviri"
              icon="language-outline"
              onPress={() => navigation.navigate('LegalTranslation')}
              onInfoPress={() => handleInfoPress("Hukuki Çeviri")}
            />
            
            <FeatureCard
              title="Belge İncele"
              icon="document-outline"
              onPress={() => navigation.navigate('DocumentAnalysis')}
              onInfoPress={() => handleInfoPress("Belge İncele")}
            />
            
            <FeatureCard
              title="Hesaplamalar"
              icon="calculator-outline"
              onPress={() => navigation.navigate('Calculations')}
              onInfoPress={() => handleInfoPress("Hesaplamalar")}
            />
          </View>
        </View>

        {/* Subscription Info */}
        {userData && userData.subscription && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Abonelik Bilgileri</Text>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionRow}>
                <View style={styles.subscriptionItem}>
                  <Ionicons name="diamond-outline" size={24} color="#193353" />
                  <Text style={styles.subscriptionText}>Paket: {userData.subscription.plan}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Text style={styles.detailsLink}>Detaylar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionButton 
              title="Yardım"
              icon="help-circle-outline"
              onPress={() => navigation.navigate('Help')}
            />
            <QuickActionButton 
              title="SSS"
              icon="information-circle-outline"
              onPress={() => navigation.navigate('FAQ')}
            />
            <QuickActionButton 
              title="Çıkış Yap"
              icon="log-out-outline"
              onPress={handleLogout}
              color="#FF6B6B"
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Toast Component */}
      <Toast 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={hideToast}
      />
    </SafeAreaView>
  );
};

const FeatureCard = ({ title, icon, onPress, onInfoPress }) => (
  <View style={styles.featureCardContainer}>
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={32} color="#193353" />
      </View>
      <Text style={styles.featureText}>{title}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.infoButton} onPress={onInfoPress}>
      <Ionicons name="information-circle" size={20} color="#4A90E2" />
    </TouchableOpacity>
  </View>
);

const QuickActionButton = ({ title, icon, onPress, color = "#193353" }) => (
  <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.quickActionText, { color: color }]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    paddingTop: 15,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#193353',
    marginLeft: 5,
    flex: 1,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
  },
  userCard: {
    margin: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#193353',
  },
  planText: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  creditsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  sectionContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#193353',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCardContainer: {
    width: '48%',
    position: 'relative',
    marginBottom: 16,
  },
  featureCard: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    padding: 15,
  },
  featureIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#193353',
    textAlign: 'center',
  },
  infoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#193353',
    marginLeft: 10,
  },
  detailsLink: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
});

export default MenuScreen;