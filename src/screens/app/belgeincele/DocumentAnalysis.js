import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { Wave } from 'react-native-animated-spinkit';
import { useSelector } from 'react-redux';
import { selectSignIn } from '../../../slices/authSlices';
import Toast from "../../../functions/Toast";
import { pickDocument } from '../../../functions/FilePermission';
import RNFS from 'react-native-fs';
import { selectUserName } from '../../../slices/userSlices';
import LoadingAnimation from '../../../functions/LoadingAnimation';
import SonucModal from '../hesaplamalar/SonucModal';
// Document Preview Modal with Fixed URL Handling
const DocumentPreviewModal = ({ fileUri, fileType, visible, onClose, loading }) => {
    const [loadingWebView, setLoadingWebView] = useState(true);
    const [fileError, setFileError] = useState(false);
    const [textContent, setTextContent] = useState(''); // Text dosyası içeriği için state
    
    // Properly format the file URI for WebView compatibility
    const getFormattedUri = () => {
      if (!fileUri) return null;
      
      // For iOS, ensure we have the correct file:// prefix
      if (Platform.OS === 'ios' && !fileUri.startsWith('file://')) {
        return `file://${fileUri}`;
      }
      
      // Android URIs are typically already formatted correctly
      return fileUri;
    };
  
    // Reset error state when the modal becomes visible
    useEffect(() => {
      if (visible) {
        setFileError(false);
        if (fileType === 'text/plain') {
          readTextFile();
        }
      }
    }, [visible, fileUri, fileType]);
    
    // Text dosyası okuma fonksiyonu
    const readTextFile = async () => {
      try {
        if (!fileUri) return;
        
        if (Platform.OS === 'android') {
          const content = await RNFS.readFile(fileUri, 'utf8');
          setTextContent(content);
        } else {
          // iOS için dosya okuma
          const content = await RNFS.readFile(fileUri.replace('file://', ''), 'utf8');
          setTextContent(content);
        }
      } catch (error) {
        console.error('Text dosyası okuma hatası:', error);
        setFileError(true);
        setTextContent("Dosya okunamadı");
      }
    };
  
    // Render document preview based on file type
    const renderDocumentPreview = () => {
      // Handle loading state
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <Wave size={48} color="#4A90E2" />
            <Text style={styles.loadingText}>Belge yükleniyor...</Text>
          </View>
        );
      }
  
      // Handle error state
      if (fileError) {
        return (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#EDF2F7" />
            <Text style={styles.errorTitle}>Belge Yüklenemedi</Text>
            <Text style={styles.errorText}>
              Belge görüntülenirken bir hata oluştu. Lütfen belgenin geçerli olduğundan emin olun.
            </Text>
          </View>
        );
      }
  
      const formattedUri = getFormattedUri();
  
      // Handle different file types
      if (fileType === 'application/pdf') {
        return (
          <WebView
            source={{ uri: formattedUri }}
            style={styles.webView}
            onLoadStart={() => setLoadingWebView(true)}
            onLoad={() => setLoadingWebView(false)}
            onError={() => {
              setLoadingWebView(false);
              setFileError(true);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            renderError={(errorDomain, errorCode, errorDesc) => {
              setFileError(true);
              return (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={64} color="#EDF2F7" />
                  <Text style={styles.errorTitle}>Belge Yüklenemedi</Text>
                  <Text style={styles.errorText}>
                    Belge görüntülenirken bir hata oluştu: {errorDesc}
                  </Text>
                </View>
              );
            }}
          />
        );
      } else if (fileType === 'text/plain') {
        return (
          <ScrollView style={styles.textPreview}>
            <Text style={styles.textContent}>{textContent}</Text>
          </ScrollView>
        );
      } else {
        // For unsupported files
        return (
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={64} color="#EDF2F7" />
            <Text style={styles.errorTitle}>Önizleme Kullanılamıyor</Text>
            <Text style={styles.errorText}>
              Bu dosya türü ({fileType}) için önizleme özelliği desteklenmemektedir.
            </Text>
          </View>
        );
      }
    };
  
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="arrow-back" size={24} color="#193353" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Belge Önizleme</Text>
          </View>
  
          <View style={styles.previewContainer}>
            {loadingWebView && fileType === 'application/pdf' && !fileError && (
              <View style={[styles.loadingContainer, styles.webViewLoading]}>
                <Wave size={48} color="#4A90E2" />
                <Text style={styles.loadingText}>Belge yükleniyor...</Text>
              </View>
            )}
            {renderDocumentPreview()}
          </View>
        </SafeAreaView>
      </Modal>
    );
};

// File Upload Card Component
const FileUploadCard = ({ 
  selectedFile, 
  handleFilePick, 
  handleRemoveFile, 
  handlePreview 
}) => (
  <View style={styles.uploadCardContainer}>
    <View style={styles.uploadCard}>
      {selectedFile ? (
        // Show selected file info
        <View style={styles.selectedFileContainer}>
          <View style={styles.fileIconContainer}>
            <Ionicons 
              name={
                selectedFile.type === 'application/pdf' ? 'document-text' : 
                selectedFile.type === 'text/plain' ? 'document' : 
                'document-attach'
              } 
              size={32} 
              color="#193353" 
            />
          </View>
          <View style={styles.fileInfoContainer}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
          </View>
          <View style={styles.fileActionButtons}>
           
            <TouchableOpacity 
              style={styles.fileActionButton} 
              onPress={handleRemoveFile}
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Show upload button when no file is selected
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={handleFilePick}
        >
          <Ionicons name="cloud-upload-outline" size={40} color="#4A90E2" />
          <Text style={styles.uploadText}>Belgenizi Seçin</Text>
          <Text style={styles.uploadSubtext}>
            PDF, DOCX, DOC, TXT (Maksimum 10MB)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Text Input Component
const TextInputCard = ({ text, setText }) => (
  <View style={styles.textInputCardContainer}>
    <View style={styles.textInputCard}>
      <TextInput
        style={styles.textInput}
        multiline={true}
        placeholder="Metninizi buraya yapıştırın..."
        placeholderTextColor="#6B7C93"
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />
    </View>
  </View>
);

// Result Modal Component
// Result Modal Component
const ResultModal = ({ visible, onClose, result }) => {
  // Format the result based on its type
  const formatResult = () => {
    if (!result) return '';
    
    // If result is a string, return it directly
    if (typeof result === 'string') return result;
    
    // If result is an object
    if (typeof result === 'object') {
      // Check if it has a 'result' property
      if (result.result) {
        // If result.result is a string, return it
        if (typeof result.result === 'string') return result.result;
        
        // Otherwise, stringify the object properly
        return JSON.stringify(result.result, null, 2);
      }
      
      // If no result property, stringify the whole object
      return JSON.stringify(result, null, 2);
    }
    
    return 'No result to display';
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color="#193353" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Analiz Sonucu</Text>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              // Share functionality would go here
              Alert.alert('Paylaş', 'Paylaşma özelliği yakında eklenecek');
            }}
          >
            <Ionicons name="share-outline" size={24} color="#193353" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultContainer}>
          <Text style={styles.resultText}>{formatResult()}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Main Component
const DocumentAnalysis = ({ navigation }) => {
  // States
  const [inputText, setInputText] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileArray, setFileArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [result, setResult] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [analysisMode, setAnalysisMode] = useState('analyze'); // 'analyze' or 'summarize'
  const API_URL = 'https://api.hukukchat.com'; // API URL
const token = useSelector(selectSignIn)
const username = useSelector(selectUserName)
// Document OCR işlemi için fonksiyon
const processDocumentOcr = async (file) => {
  try {
    console.log('Processing OCR for file:', file.name);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type
    });
    
    // For FormData, don't set 'Content-Type': 'application/json'
    const response = await fetch(`${API_URL}/process_ocr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` // Make sure to use token.token
      },
      body: formData
    });
    
    console.log('OCR Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OCR Error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || 'Belge işlenirken bir hata oluştu');
      } catch (parseError) {
        throw new Error('Belge işlenirken bir hata oluştu: ' + response.status);
      }
    }
    
    const responseData = await response.json();
    console.log('OCR process successful');
    return responseData;
    
  } catch (error) {
    console.error('Belge OCR işlemi hatası:', error);
    throw error;
  }
};

// Belge analiz/özetleme işlemi için fonksiyon
// Belge analiz/özetleme işlemi için fonksiyon
const processDocumentAnalysis = async (data) => {
  try {
    console.log('Processing document analysis with data:', data);
    
    // Make sure token is valid
    if (!token) {
      throw new Error('Kimlik doğrulama bilgisi bulunamadı');
    }
    
    // Use the same endpoint as the web version
    const response = await fetch(`${API_URL}/process_dilekce_text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    console.log('Analysis Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analysis Error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || 'Belge analiz edilirken bir hata oluştu');
      } catch (parseError) {
        throw new Error('Belge analiz edilirken bir hata oluştu: ' + response.status);
      }
    }
    
    const responseData = await response.json();
    console.log('Document analysis successful');
    return responseData;
    
  } catch (error) {
    console.error('Belge analiz işlemi hatası:', error);
    throw error;
  }
};

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info'
  });
  
  // Access user token
  
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

  // Handle file picking
  const handleFilePick = async () => {
    try {
      // pickDocument fonksiyonunu çağır - fileArray ve setFileArray ile
      const result = await pickDocument(fileArray, setFileArray);
      
      if (result.success && fileArray.length > 0) {
        // Birden fazla dosya seçilirse birleşik metin oluştur
        if (fileArray.length > 1) {
          setLoading(true);
          let combinedText = "";
          
          for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            try {
              const ocrResult = await processDocumentOcr({
                uri: file.uri,
                type: file.type,
                name: file.name,
              }, token);
              
              combinedText += `${i + 1}. dosya:\n${ocrResult.ocr_text}\n\n`;
            } catch (err) {
              console.error(`Dosya #${i + 1} OCR hatası:`, err);
            }
          }
          
          setInputMode('text');
          setInputText(combinedText);
          setLoading(false);
          showToast(`${fileArray.length} dosya başarıyla işlendi`, 'success');
        } else {
          // Tek dosya seçilirse normal işlemi yap
          const lastFile = fileArray[fileArray.length - 1];
          setSelectedFile(lastFile);
          setInputMode('file');
          showToast('Dosya başarıyla yüklendi', 'success');
        }
      } else if (result.error) {
        if (result.error.message !== 'Kullanıcı iptal etti') {
          showToast(result.error.message || 'Dosya seçilirken bir hata oluştu', 'error');
        }
      }
    } catch (err) {
      console.error('Dosya seçim hatası:', err);
      showToast('Dosya seçilirken bir hata oluştu', 'error');
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    if (fileArray.length > 0) {
      const index = fileArray.findIndex(file => file.uri === selectedFile.uri);
      if (index !== -1) {
        const updatedFileArray = [...fileArray];
        updatedFileArray.splice(index, 1);
        setFileArray(updatedFileArray);
        
        // Eğer başka dosya varsa, onu seç
        if (updatedFileArray.length > 0) {
          setSelectedFile(updatedFileArray[0]);
        } else {
          setSelectedFile(null);
        }
        
        showToast('Dosya kaldırıldı', 'info');
      }
    } else {
      setSelectedFile(null);
      showToast('Dosya kaldırıldı', 'info');
    }
  };

  // Handle file preview
  const handlePreview = () => {
    if (selectedFile) {
      setPreviewVisible(true);
    }
  };
  const handleSuggestAction = () => {
    if (result && result.result) {
      const requestData = {
        contract_text: inputMode === 'file' ? (selectedFile ? selectedFile.text : '') : inputText,
        action: 'suggest',
        additional_info: notes || '',
        user_id: username,
        suggestions: result.result // Pass previous result as suggestions
      };
      
      // Call processDocumentAnalysis with the suggest action
      processDocumentAnalysis(requestData)
        .then(responseData => {
          setResult(responseData);
          setResultVisible(true);
        })
        .catch(error => {
          console.error('Belge güncelleme hatası:', error);
          showToast('Belge güncellemesi sırasında bir hata oluştu: ' + error.message, 'error');
        });
    }
  };
  
  
// Handle submit (analyze or summarize)
const handleSubmit = async () => {
  // Validate input
  if (inputMode === 'file' && !selectedFile) {
    showToast('Lütfen bir dosya seçin veya metin girin', 'warning');
    return;
  }
  
  if (inputMode === 'text' && !inputText.trim()) {
    showToast('Lütfen bir metin girin', 'warning');
    return;
  }
  
  // Validate token
  if (!token) {
    showToast('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.', 'error');
    return;
  }
  
  setLoading(true);
  
  try {
    let textContent = '';
    
    // Dosya modu ise OCR işlemi yap
    if (inputMode === 'file') {
      try {
        const ocrResult = await processDocumentOcr({
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name,
        });
        
        textContent = ocrResult.ocr_text || '';
        console.log('OCR text extracted successfully:', textContent.substring(0, 50) + '...');
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
        showToast('Belge metni çıkarılırken bir hata oluştu: ' + ocrError.message, 'error');
        setLoading(false);
        return;
      }
    } else {
      textContent = inputText;
    }
    
    // Map the local action values to what the backend expects - based on web implementation
    const backendAction = analysisMode === 'analyze' ? 'review' : 
                         analysisMode === 'summarize' ? 'summarize' : 'review';
    
    console.log(`Using backend action: ${backendAction} for local action: ${analysisMode}`);
    
    // Analiz veya özet isteği gönder - align with web implementation
    const requestData = {
      contract_text: textContent,
      action: backendAction,
      additional_info: notes || '', 
      user_id: username,
      suggestions: null // Based on web implementation that includes this field
    };
    
    console.log('Sending analysis request with:', {
      textLength: textContent.length,
      action: backendAction,
      hasNotes: notes ? 'yes' : 'no',
      userId: username
    });
    
    // Use the correct endpoint that matches web implementation
    const analysisResult = await fetch(`${API_URL}/process_dilekce_text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!analysisResult.ok) {
      const errorText = await analysisResult.text();
      console.error('Analysis Error response:', errorText);
      throw new Error('Belge analiz edilirken bir hata oluştu: ' + analysisResult.status);
    }
    
    const responseData = await analysisResult.json();
    console.log('Analysis result:', responseData);
    setResult(responseData);
    setResultVisible(true);
  } catch (error) {
    console.error('Belge analiz hatası:', error);
    showToast('Belge analizi sırasında bir hata oluştu: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
};
  // Toggle input mode - file or text
  const toggleInputMode = (mode) => {
    setInputMode(mode);
  };

  // Toggle analysis mode - analyze or summarize
  const toggleAnalysisMode = (mode) => {
    setAnalysisMode(mode);
  };
  
  // Show info popup about the feature
  const showInfoPopup = () => {
    Alert.alert(
      "Belge İnceleme Hakkında",
      "Bu özellik ile hukuki belgelerinizi analiz edebilir veya özetletebilirsiniz. PDF, DOCX, DOC ve TXT formatındaki belgelerinizi yükleyebilir veya metni doğrudan yapıştırabilirsiniz.",
      [{ text: "Anladım", style: "default" }]
    );
  };
  
  // Update selectedFile when fileArray changes
  useEffect(() => {
    if (fileArray.length > 0 && !selectedFile) {
      setSelectedFile(fileArray[0]);
    }
  }, [fileArray]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#193353" />
      
      {/* Toast Notification */}
      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
     <LoadingAnimation
        visible={loading}
        title="Dosyanız İşleniyor"
        message="Dosyalarınız işleniyor, lütfen bekleyin..."
        ballColors={{
          ball1: '#D77A25',
          ball2: '#4A90E2',
          ball3: '#193353'
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="arrow-back" size={24} color="#193353" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Belge İncele</Text>
        <TouchableOpacity style={styles.infoButton} onPress={showInfoPopup}>
          <Ionicons name="information-circle-outline" size={24} color="#193353" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          {/* Input Mode Selector */}
          <View style={styles.inputSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.inputSelectorButton,
                inputMode === 'file' && styles.inputSelectorButtonActive
              ]}
              onPress={() => toggleInputMode('file')}
            >
              <Ionicons 
                name="document-outline" 
                size={20} 
                color={inputMode === 'file' ? '#FFFFFF' : '#193353'} 
              />
              <Text 
                style={[
                  styles.inputSelectorText,
                  inputMode === 'file' && styles.inputSelectorTextActive
                ]}
              >
                Belge Yükle
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.inputSelectorButton,
                inputMode === 'text' && styles.inputSelectorButtonActive
              ]}
              onPress={() => toggleInputMode('text')}
            >
              <Ionicons 
                name="create-outline" 
                size={20} 
                color={inputMode === 'text' ? '#FFFFFF' : '#193353'} 
              />
              <Text 
                style={[
                  styles.inputSelectorText,
                  inputMode === 'text' && styles.inputSelectorTextActive
                ]}
              >
                Metin Yapıştır
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Area */}
          <View style={styles.inputArea}>
            {inputMode === 'file' ? (
              <FileUploadCard 
                selectedFile={selectedFile}
                handleFilePick={handleFilePick}
                handleRemoveFile={handleRemoveFile}
                handlePreview={handlePreview}
              />
            ) : (
              <TextInputCard 
                text={inputText}
                setText={setInputText}
              />
            )}
          </View>

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>
              Dikkate edilmesini istediğiniz noktaları belirtiniz:
            </Text>
            <View style={styles.notesInputCard}>
              <TextInput
                style={styles.notesInput}
                multiline={true}
                placeholder="Belgenizle ilgili özel taleplerinizi buraya yazabilirsiniz..."
                placeholderTextColor="#6B7C93"
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Analysis Mode Selector */}
          <View style={styles.analysisSelectorContainer}>
            <Text style={styles.analysisSelectorLabel}>İşlem Türü:</Text>
            <View style={styles.analysisSelectorButtons}>
              <TouchableOpacity
                style={[
                  styles.analysisSelectorButton,
                  analysisMode === 'analyze' && styles.analysisSelectorButtonActive
                ]}
                onPress={() => toggleAnalysisMode('analyze')}
              >
                <Ionicons 
                  name="search-outline" 
                  size={20} 
                  color={analysisMode === 'analyze' ? '#FFFFFF' : '#193353'} 
                />
                <Text 
                  style={[
                    styles.analysisSelectorText,
                    analysisMode === 'analyze' && styles.analysisSelectorTextActive
                  ]}
                >
                  Analiz Et
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.analysisSelectorButton,
                  analysisMode === 'summarize' && styles.analysisSelectorButtonActive
                ]}
                onPress={() => toggleAnalysisMode('summarize')}
              >
                <Ionicons 
                  name="list-outline" 
                  size={20} 
                  color={analysisMode === 'summarize' ? '#FFFFFF' : '#193353'} 
                />
                <Text 
                  style={[
                    styles.analysisSelectorText,
                    analysisMode === 'summarize' && styles.analysisSelectorTextActive
                  ]}
                >
                  Özetle
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons 
                  name={analysisMode === 'analyze' ? 'search' : 'list'} 
                  size={20} 
                  color="#FFFFFF" 
                  style={styles.submitButtonIcon}
                />
                <Text style={styles.submitButtonText}>
                  {analysisMode === 'analyze' ? 'Analiz Et' : 'Özetle'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Document Preview Modal */}
      {selectedFile && (
        <DocumentPreviewModal 
          fileUri={selectedFile.uri}
          fileType={selectedFile.type}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          loading={false}
        />
      )}

      {/* Result Modal */}
      <SonucModal
        visible={resultVisible}
        onClose={() => setResultVisible(false)}
        result={result}
        title={analysisMode === 'analyze' ? 'Analiz Sonucu' : 'Özet Sonucu'}
        ></SonucModal>
     
    </SafeAreaView>
  );
};

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
    backgroundColor: 'white',
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
  scrollView: {
    flex: 1,
  },
  // Input Mode Selector styles
  inputSelectorContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#E6F0FB',
    borderRadius: 12,
    padding: 4,
  },
  inputSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  inputSelectorButtonActive: {
    backgroundColor: '#4A90E2',
  },
  inputSelectorText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#193353',
  },
  inputSelectorTextActive: {
    color: '#FFFFFF',
  },
  // Input Area styles
  inputArea: {
    margin: 16,
    marginTop: 8,
  },
  // File Upload Card styles
  uploadCardContainer: {
    marginBottom: 16,
  },
  uploadCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  uploadButton: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
    marginTop: 16,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedFileContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F0FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
  },
  fileSize: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 4,
  },
  fileActionButtons: {
    flexDirection: 'row',
  },
  fileActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Text Input Card styles
  textInputCardContainer: {
    marginBottom: 16,
  },
  textInputCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  textInput: {
    padding: 16,
    minHeight: 150,
    fontSize: 16,
    color: '#193353',
  },
  // Notes styles
  notesContainer: {
    margin: 16,
    marginTop: 0,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
    marginBottom: 8,
  },
  notesInputCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  notesInput: {
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    color: '#193353',
  },
  // Analysis Mode Selector styles
  analysisSelectorContainer: {
    margin: 16,
    marginTop: 0,
  },
  analysisSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
    marginBottom: 8,
  },
  analysisSelectorButtons: {
    flexDirection: 'row',
    backgroundColor: '#E6F0FB',
    borderRadius: 12,
    padding: 4,
  },
  analysisSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  analysisSelectorButtonActive: {
    backgroundColor: '#4A90E2',
  },
  analysisSelectorText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#193353',
  },
  analysisSelectorTextActive: {
    color: '#FFFFFF',
  },
  // Submit Button styles
  submitButton: {
    backgroundColor: '#4A90E2',
    margin: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonIcon: {
    marginRight: 8,
  },
  // Preview Modal styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#193353',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    padding: 5,
  },
  shareButton: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  webView: {
    flex: 1,
  },
  textPreview: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  textContent: {
    fontSize: 16,
    color: '#193353',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#193353',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  // Result Modal styles
  resultContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  resultText: {
    fontSize: 16,
    color: '#193353',
    lineHeight: 24,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#193353',
    marginBottom: 8,
  },
  errorText: {
    color: '#6B7C93',
    textAlign: 'center',
    fontSize: 14,
    marginHorizontal: 20,
  },
  // Sample Prompts Button styles - yeni eklenen stil
  samplePromptsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8, 
    padding: 6,
  },
  samplePromptsText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4A90E2',
  }
});

export default DocumentAnalysis;