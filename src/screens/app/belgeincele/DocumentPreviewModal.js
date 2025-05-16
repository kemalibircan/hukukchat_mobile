import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Wave } from 'react-native-animated-spinkit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

const DocumentPreviewModal = ({ fileUri, fileType, visible, onClose, loading }) => {
  const [loadingWebView, setLoadingWebView] = useState(true);
  const [fileError, setFileError] = useState(false);
  const [textContent, setTextContent] = useState('');
  
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

const styles = StyleSheet.create({
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
});

export default DocumentPreviewModal;