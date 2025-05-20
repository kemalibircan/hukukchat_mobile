import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  
  // Check if user has seen welcome screen before
  useEffect(() => {
    checkFirstTime();
  }, []);
  
  const checkFirstTime = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      if (hasSeenWelcome === 'true') {
        // Skip to login if user has seen welcome screen
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error checking first time status:', error);
    }
  };
  
  const handleContinue = async () => {
    try {
      // Mark that user has seen welcome screen
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error saving first time status:', error);
    }
  };
  
  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error saving skip status:', error);
    }
  };
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleContinue();
    }
  };
  
  // Welcome screen content slides
  const slides = [
    {
      id: 1,
      title: 'Hukuk Teknolojisinde Yeni Nesil',
      description: 'Yapay zeka destekli hukuki asistan ile hukuki işlerinizi kolaylaştırın.',
      icon: 'chatbubbles-outline',
    },
    {
      id: 2,
      title: 'İçtihat ve Mevzuat',
      description: 'Türkiye\'deki yüksek mahkeme kararlarını ve tüm mevzuatı kolayca arayın ve erişin.',
      icon: 'document-text-outline',
    },
    {
      id: 3,
      title: 'Hukuki Çeviri',
      description: 'Profesyonel çeviri desteği ile hukuki metinlerinizi doğru terminoloji ile çevirin.',
      icon: 'language-outline',
    },
    {
      id: 4,
      title: 'Hazırsınız!',
      description: 'Hukuk alanında yapay zekanın sunduğu avantajları keşfetmek için hemen başlayalım!',
      icon: 'rocket-outline',
    }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Skip button */}
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSkip}>
        <Text style={styles.skipText}>Atla</Text>
      </TouchableOpacity>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require('../../icons/1.png')}
        />
      </View>
      
      {/* Slide Content */}
      <View style={styles.slideContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={slides[currentSlide].icon} size={80} color="#193353" />
        </View>
        <Text style={styles.slideTitle}>{slides[currentSlide].title}</Text>
        <Text style={styles.slideDescription}>{slides[currentSlide].description}</Text>
      </View>
      
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.paginationDot, 
              index === currentSlide ? styles.paginationDotActive : {}
            ]} 
          />
        ))}
      </View>
      
      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        {currentSlide < slides.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>İleri</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={handleContinue}>
            <Text style={styles.startButtonText}>Başlayalım</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* About Link */}
      <TouchableOpacity 
        style={styles.aboutLink}
        onPress={() => setAboutModalVisible(true)}>
        <Text style={styles.aboutLinkText}>Bizi daha yakından tanıyın</Text>
      </TouchableOpacity>
      
      {/* About Modal with WebView */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hakkımızda</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setAboutModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#193353" />
              </TouchableOpacity>
            </View>
            <WebView 
              source={{ uri: 'https://hukukchat.com/hakkimizda' }} 
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <Text>Yükleniyor...</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  logoContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 70,
  },
  slideContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#193353',
    textAlign: 'center',
    marginBottom: 15,
  },
  slideDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 40,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#4A90E2',
    width: 20,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  startButton: {
    backgroundColor: '#193353',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  aboutLink: {
    marginTop: 15,
    paddingVertical: 10,
  },
  aboutLinkText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#193353',
  },
  closeButton: {
    padding: 5,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default WelcomeScreen;