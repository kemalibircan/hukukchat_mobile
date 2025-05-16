import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  FlatList,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { selectSignIn } from '../../../slices/authSlices';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from '../../../functions/Toast';
import { selectUserName } from '../../../slices/userSlices';

// Custom Modern Language Selector Component
const CustomLanguageSelector = ({ selectedLanguage, onLanguageChange, languages, label }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSelectLanguage = (language) => {
    onLanguageChange(language);
    toggleModal();
  };

  return (
    <View style={styles.languageSelectorContainer}>
      <Text style={styles.languageLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.customPickerContainer}
        onPress={toggleModal}
        activeOpacity={0.7}
      >
        <Text style={styles.selectedLanguageText}>{selectedLanguage}</Text>
        <Ionicons name="chevron-down" size={18} color="#193353" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label} Seçin</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" size={24} color="#193353" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={languages}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    selectedLanguage === item && styles.selectedLanguageItem
                  ]}
                  onPress={() => handleSelectLanguage(item)}
                >
                  <Text 
                    style={[
                      styles.languageItemText,
                      selectedLanguage === item && styles.selectedLanguageItemText
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedLanguage === item && (
                    <Ionicons name="checkmark" size={20} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Main Component
const LegalTranslation = () => {
  const navigation = useNavigation();
  const userToken = useSelector(selectSignIn);
  const username = useSelector(selectUserName)
  // States
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('İngilizce');
  const [targetLanguage, setTargetLanguage] = useState('Türkçe');
  const [loading, setLoading] = useState(false);
  const [lastChunkId, setLastChunkId] = useState(null);
  
  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info'
  });
  
  // Available languages
  const languages = [
    'Türkçe',
    'İngilizce',
    'Almanca',
    'Fransızca',
    'İspanyolca',
    'İtalyanca',
    'Rusça',
    'Çince',
    'Japonca',
    'Arapça'
  ];

  // Show toast function
  const showToast = (message, type = 'info') => {
    setToast({
      visible: true,
      message,
      type
    });
  };
  
  // Hide toast function
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  // Translation API call
  const translateText = async () => {
    if (!sourceText.trim()) {
      showToast('Lütfen çevrilecek metni girin', 'warning');
      return;
    }
    
    if (sourceLanguage === targetLanguage) {
      showToast('Kaynak ve hedef dil aynı olamaz', 'warning');
      return;
    }
    
    setLoading(true);
    Keyboard.dismiss();
    
    try {
      // Get user ID from userToken or use a default value
      const userId = username || 'defaultUser';
      
      // Construct the URL with user_id as a query parameter
      const url = `https://api.hukukchat.com/sozlesmetercume?user_id=${encodeURIComponent(userId)}`;
      
      // Create request body, properly handling the update_text parameter
      const requestBody = {
        source_text: sourceText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        is_last_chunk: true
      };
      
      // Only add update_text if it has a valid string value
      if (lastChunkId) {
        requestBody.update_text = lastChunkId;
      } else {
        // If no lastChunkId, send an empty string instead of null
        requestBody.update_text = "";
      }
      
      console.log('Sending request to:', url);
      console.log('Request body:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      // For debugging - log the response status
      console.log('Response status:', response.status);
      
      // For better error handling, try to get the error message from the response
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server error: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('Translation response:', data);
      if (data.translated_text) {
        setTranslatedText(data.translated_text);
        setLastChunkId(data.chunk_id);
        showToast('Çeviri başarıyla tamamlandı', 'success');
      } else {
        throw new Error('Translation response is empty');
      }
    } catch (error) {
      console.error('Translation error:', error);
      showToast('Çeviri işlemi sırasında bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Swap languages
  const swapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Also swap text if translated text exists
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
    
    showToast('Diller değiştirildi', 'info');
  };
  
  // Copy translated text to clipboard
  const copyToClipboard = async () => {
    if (!translatedText) {
      showToast('Kopyalanacak çeviri bulunamadı', 'warning');
      return;
    }
    
    try {
      Clipboard.setString(translatedText);
      showToast('Çeviri panoya kopyalandı', 'success');
    } catch (error) {
      showToast('Kopyalama işlemi başarısız', 'error');
    }
  };
  
  // Clear both text fields
  const clearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setLastChunkId(null);
    showToast('Tüm metin temizlendi', 'info');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />
      
      {/* Toast Notification */}
      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="arrow-back" size={24} color="#193353" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hukuki Çeviri</Text>
        <TouchableOpacity 
          style={styles.infoButton} 
          onPress={() => showToast('Hukuki metinlerinizi farklı dillere çevirebilirsiniz', 'info')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#193353" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Language Selection Row */}
          <View style={styles.languageRow}>
            <CustomLanguageSelector
              selectedLanguage={sourceLanguage}
              onLanguageChange={(value) => setSourceLanguage(value)}
              languages={languages}
              label="Kaynak Dil"
            />
            
            <TouchableOpacity 
              style={styles.swapButton}
              onPress={swapLanguages}
            >
              <Ionicons name="swap-horizontal" size={24} color="#4A90E2" />
            </TouchableOpacity>
            
            <CustomLanguageSelector
              selectedLanguage={targetLanguage}
              onLanguageChange={(value) => setTargetLanguage(value)}
              languages={languages}
              label="Hedef Dil"
            />
          </View>
          
          {/* Source Text Input */}
          <View style={styles.textAreaContainer}>
            <Text style={styles.textAreaLabel}>Çevrilecek Metin</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                multiline
                placeholder="Çevrilecek hukuki metni buraya yazın..."
                placeholderTextColor="#6B7C93"
                value={sourceText}
                onChangeText={setSourceText}
                textAlignVertical="top"
              />
              {sourceText ? (
                <TouchableOpacity
                  style={styles.clearTextButton}
                  onPress={() => setSourceText('')}
                >
                  <Ionicons name="close-circle" size={22} color="#6B7C93" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          
          {/* Translate Button */}
          <TouchableOpacity
            style={[styles.translateButton, loading && styles.disabledButton]}
            onPress={translateText}
            disabled={loading || !sourceText.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="language" size={22} color="#FFFFFF" />
                <Text style={styles.translateButtonText}>Çevir</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Translated Text Output */}
          <View style={styles.textAreaContainer}>
            <View style={styles.translatedHeaderRow}>
              <Text style={styles.textAreaLabel}>Çeviri Sonucu</Text>
              {translatedText ? (
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyToClipboard}
                >
                  <Ionicons name="copy-outline" size={18} color="#4A90E2" />
                  <Text style={styles.copyButtonText}>Kopyala</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={[
              styles.textAreaWrapper, 
              styles.translatedTextArea,
              !translatedText && styles.emptyTranslatedArea
            ]}>
              {translatedText ? (
                <Text style={styles.translatedText}>{translatedText}</Text>
              ) : (
                <View style={styles.emptyTranslationContent}>
                  <Ionicons 
                    name="document-text-outline" 
                    size={48} 
                    color="#E6F0FB" 
                  />
                  <Text style={styles.emptyTranslationText}>
                    Çeviri sonucu burada görünecek
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Clear All Button */}
          {(sourceText || translatedText) ? (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearAll}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              <Text style={styles.clearAllButtonText}>Tümünü Temizle</Text>
            </TouchableOpacity>
          ) : null}
          
          {/* Notice about translation quality */}
          <View style={styles.noticeContainer}>
            <Ionicons name="alert-circle-outline" size={18} color="#6B7C93" />
            <Text style={styles.noticeText}>
              Çevirilerimiz yapay zeka destekli olup, %100 doğruluk garantisi vermemektedir. Resmi işlemlerde profesyonel bir çevirmen desteği almanız önerilir.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default LegalTranslation;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor:'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#193353',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 5,
  },
  infoButton: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  languageSelectorContainer: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#193353',
    marginBottom: 8,
  },
  customPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6F0FB',
    height: 46,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedLanguageText: {
    fontSize: 15,
    color: '#193353',
  },
  swapButton: {
    backgroundColor: '#E6F0FB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 24,
  },
  textAreaContainer: {
    marginBottom: 20,
  },
  textAreaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#193353',
    marginBottom: 8,
  },
  textAreaWrapper: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6F0FB',
    padding: 12,
    minHeight: 150,
    position: 'relative',
  },
  textArea: {
    fontSize: 16,
    color: '#1E3A5F',
    minHeight: 130,
    padding: 0,
  },
  clearTextButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    backgroundColor: '#F5F7FA',
    borderRadius: 15,
  },
  translateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  translateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  translatedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FB',
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  copyButtonText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  translatedTextArea: {
    minHeight: 150,
    padding: 15,
  },
  emptyTranslatedArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  translatedText: {
    fontSize: 16,
    color: '#1E3A5F',
    lineHeight: 22,
  },
  emptyTranslationContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTranslationText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7C93',
    textAlign: 'center',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  clearAllButtonText: {
    color: '#FF6B6B',
    fontWeight: '500',
    marginLeft: 8,
  },
  noticeContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F0F4F9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7C93',
    marginLeft: 8,
    lineHeight: 18,
  },
  // Modal styles for custom language selector
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F0FB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#193353',
  },
  languageList: {
    maxHeight: '80%',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F9',
  },
  selectedLanguageItem: {
    backgroundColor: '#E6F0FB',
  },
  languageItemText: {
    fontSize: 16,
    color: '#1E3A5F',
  },
  selectedLanguageItemText: {
    color: '#4A90E2',
    fontWeight: '600',
  }
});