import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Dimensions,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const faqData = [
  {
    title: "Neden HukukChat?",
    content: "HukukChat, GPT-3.5 ve GPT-4 Turbo teknolojileriyle hukuk alanına yenilik getiriyor. Derinlemesine anlama ve kapsamlı analiz yetenekleriyle, hukuki metin hazırlamada devrim yaratıyor."
  },
  {
    title: "HukukChat'ın Rakiplerinden Farkları?",
    content: "HukukChat, sürekli evrilen, teknolojik olarak ileri seviye bir platformdur. En son yapay zeka teknolojilerini kullanan altyapımız, size her zaman bir adım önde olma avantajı sunar."
  },
  {
    title: "Daha Detaylı Bilgilere Nereden Ulaşırım?",
    content: "https://www.hukukchat.com/ web sayfası üzerinden bizimle ilgili daha detaylı bilgilere ulaşabilirsiniz."
  },
  {
    title: "Webde Arama Nedir?",
    content: "Web üzerinden döküman arama özelliği, kullanıcıların internet üzerindeki çeşitli kaynaklardan hukuki dökümanları, makaleleri ve diğer ilgili içerikleri hızlı ve kolay bir şekilde bulmalarını sağlayan bir araçtır."
  }
];

const FaqScreen = () => {
  const navigation = useNavigation();
  
  // Colors
  const blueColor = '#193353';
  const lightBlue = '#E6F0FB';
  const accentBlue = '#4A90E2';
  const darkText = '#1E3A5F';
  const lightText = '#6B7C93';
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={blueColor} barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'white' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={blueColor} />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        
      </View>
      
      {/* FAQ Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introContainer}>
          <View style={[styles.iconContainer, { backgroundColor: lightBlue }]}>
            <Ionicons name="help-buoy-outline" size={32} color={accentBlue} />
          </View>
          <Text style={[styles.introTitle, { color: darkText }]}>Size Nasıl Yardımcı Olabiliriz?</Text>
          <Text style={[styles.introText, { color: lightText }]}>HukukChat hakkında en çok sorulan sorular ve yanıtları aşağıda bulabilirsiniz. </Text>
        </View>
        
        {/* FAQ Items */}
        {faqData.map((item, index) => (
          <FaqItem
            key={index}
            title={item.title}
            content={item.content}
            isLast={index === faqData.length - 1}
            blueColor={blueColor}
            lightBlue={lightBlue}
            accentBlue={accentBlue}
            darkText={darkText}
            lightText={lightText}
          />
        ))}
        
        {/* Still Have Questions */}
        <View style={styles.contactContainer}>
          <Text style={[styles.contactTitle, { color: darkText }]}>Başka Sorunuz Var Mı?</Text>
          <Text style={[styles.contactText, { color: lightText }]}>
            Eğer aradığınız cevabı bulamadıysanız, bize doğrudan ulaşabilirsiniz.
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: accentBlue }]}
            onPress={() => navigation.navigate('Help')}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={20} color="white" />
            <Text style={styles.contactButtonText}>İletişim</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FaqItem = ({ title, content, isLast, blueColor, lightBlue, accentBlue, darkText, lightText }) => {
  const [expanded, setExpanded] = useState(false);
  const [spinValue] = useState(new Animated.Value(0));
  
  const toggleExpand = () => {
    // Configure next LayoutAnimation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Animate the arrow rotation
    Animated.timing(spinValue, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setExpanded(!expanded);
  };
  
  // Interpolate the spinValue to a rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  const renderContent = () => {
    if (content.includes('https://')) {
      const parts = content.split('https://');
      const beforeLink = parts[0];
      const afterLink = parts[1].split(' ');
      const link = 'https://' + afterLink[0];
      const restText = afterLink.slice(1).join(' ');
      
      return (
        <>
          <Text style={[styles.itemContent, { color: darkText }]}>{beforeLink}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(link)}>
            <Text style={[styles.itemContent, styles.linkText, { color: accentBlue }]}>{link}</Text>
          </TouchableOpacity>
          <Text style={[styles.itemContent, { color: darkText }]}>{restText}</Text>
        </>
      );
    }
    
    return <Text style={[styles.itemContent, { color: darkText }]}>{content}</Text>;
  };
  
  return (
    <View style={[
      styles.faqItem, 
      { 
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#EEF3F9',
        backgroundColor: expanded ? lightBlue : 'white',
        borderRadius: expanded ? 16 : 0,
        marginBottom: expanded ? 10 : 0,
        marginHorizontal: expanded ? 16 : 16,
        padding: expanded ? 16 : 0,
        paddingHorizontal: expanded ? 16 : 16,
      }
    ]}>
      <TouchableOpacity 
        style={styles.faqHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.titleContainer}>
          <View style={[
            styles.questionMark, 
            { backgroundColor: expanded ? accentBlue : lightBlue }
          ]}>
            <Text style={[
              styles.questionMarkText, 
              { color: expanded ? 'white' : blueColor }
            ]}>Q</Text>
          </View>
          <Text style={[styles.faqTitle, { color: darkText }]}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons 
            name="chevron-down-outline" 
            size={22} 
            color={expanded ? accentBlue : blueColor} 
          />
        </Animated.View>
      </TouchableOpacity>
      
      {/* Content */}
      {expanded && (
        <View style={styles.faqContent}>
          <View style={styles.contentInner}>
            {renderContent()}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  searchContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#EEF3F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchPlaceholder: {
    color: '#6B7C93',
    marginLeft: 8,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  introContainer: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: '90%',
  },
  faqItem: {
    paddingVertical: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  questionMark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionMarkText: {
    fontSize: 16,
    fontWeight: '700',
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  faqContent: {
    marginTop: 12,
  },
  contentInner: {
    paddingLeft: 42, // Aligns with the title text
    paddingRight: 10,
  },
  itemContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  contactContainer: {
    marginTop: 30,
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: '#F5F8FA',
    borderRadius: 16,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default FaqScreen;