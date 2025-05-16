import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  Modal,
  Linking,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { Wave } from 'react-native-animated-spinkit';

// Toast notification component
const Toast = ({ visible, message, type, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  // Define colors based on toast type
  const getToastColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#10B981', icon: 'checkmark-circle' };
      case 'error':
        return { bg: '#EF4444', icon: 'alert-circle' };
      case 'warning':
        return { bg: '#F59E0B', icon: 'warning' };
      case 'info':
      default:
        return { bg: '#4A90E2', icon: 'information-circle' };
    }
  };

  const { bg, icon } = getToastColors();

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.toastContainer, 
        { 
          backgroundColor: bg,
          opacity: fadeAnim,
          transform: [{ translateY }]
        }
      ]}
    >
      <Ionicons name={icon} size={22} color="white" />
      <Text style={styles.toastMessage}>{message}</Text>
      <TouchableOpacity onPress={handleDismiss}>
        <Ionicons name="close" size={22} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// PDF Viewer Modal
const PdfViewerModal = ({ pdfUrl, visible, onClose, loading }) => {
  const [loadingWebView, setLoadingWebView] = useState(true);

  const openExternalPdfViewer = async () => {
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        // Using Toast instead of Alert
        onClose();
        showToast('PDF görüntüleyici bulunamadı. Lütfen bir PDF görüntüleyici uygulaması yükleyin.', 'error');
      }
    } catch (error) {
      console.error('PDF açılırken hata:', error);
      onClose();
      showToast('PDF açılırken bir hata oluştu', 'error');
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
          <Text style={styles.modalTitle}>İçtihat Detayı</Text>
          
          <TouchableOpacity
            style={styles.externalButton}
            onPress={openExternalPdfViewer}
          >
            <Ionicons name="open-outline" size={24} color="#193353" />
          </TouchableOpacity>
        </View>

        <View style={styles.pdfContainer}>
          {loading ? (
            <View style={styles.pdfLoading}>
              <Wave size={48} color="#4A90E2" />
              <Text style={styles.loadingText}>PDF yükleniyor...</Text>
            </View>
          ) : (
            <>
              {loadingWebView && (
                <View style={[styles.pdfLoading, styles.webViewLoading]}>
                  <Wave size={48} color="#4A90E2" />
                  <Text style={styles.loadingText}>PDF yükleniyor...</Text>
                </View>
              )}
              <WebView
                source={{ uri: pdfUrl }}
                style={styles.webView}
                onLoadStart={() => setLoadingWebView(true)}
                onLoad={() => setLoadingWebView(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                renderError={(errorDomain, errorCode, errorDesc) => (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#EDF2F7" />
                    <Text style={styles.errorTitle}>PDF Yüklenemedi</Text>
                    <Text style={styles.errorText}>
                      PDF görüntülenirken bir hata oluştu. Harici görüntüleyici açmayı deneyin.
                    </Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={openExternalPdfViewer}
                    >
                      <Text style={styles.retryButtonText}>Harici Uygulamada Aç</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Search Bar Component
const SearchBar = ({ searchText, setSearchText, loading, handleSearch }) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchInputContainer}>
      <Ionicons name="search-outline" size={20} color="#6B7C93" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="İçtihat ara..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#6B7C93"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      {searchText ? (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setSearchText('')}
        >
          <Ionicons name="close-circle" size={18} color="#6B7C93" />
        </TouchableOpacity>
      ) : null}
    </View>
    <TouchableOpacity
      style={styles.searchButton}
      onPress={handleSearch}
      disabled={loading}
    >
      {loading ? (
        <Ionicons name="time-outline" size={20} color="#fff" />
      ) : (
        <Text style={styles.searchButtonText}>Ara</Text>
      )}
    </TouchableOpacity>
  </View>
);

// İçtihat List Item Component
const IctihatListItem = ({ item, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.ictihatItem,
      isSelected && styles.selectedIctihatItem,
    ]}
    onPress={() => onSelect(item.filename)}
    activeOpacity={0.7}
  >
    <View style={styles.ictihatItemContent}>
      <Text style={styles.ictihatTitle} numberOfLines={2}>
        {item.show_filename || 'Başlık Yok'}
      </Text>
      {item.mahkeme && (
        <Text style={styles.ictihatCourt}>
          Mahkeme: {item.mahkeme}
        </Text>
      )}
      <View style={styles.fileInfoContainer}>
        <Ionicons name="document-text-outline" size={14} color="#6B7C93" />
        <Text style={styles.fileInfo}>{item.filename}</Text>
      </View>
    </View>
    <View style={styles.arrowContainer}>
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#4A90E2"
      />
    </View>
  </TouchableOpacity>
);

// Empty State Component
// Updated Empty State Component with a reload button
const EmptyState = ({ message, onReload }) => (
  <View style={styles.emptyList}>
    <Ionicons name="document-text-outline" size={64} color="#E6F0FB" />
    <Text style={styles.emptyListTitle}>
      İçtihat Bulunamadı
    </Text>
    <Text style={styles.emptyListText}>
      {message || "Farklı anahtar kelimelerle tekrar aramayı deneyin"}
    </Text>
    <TouchableOpacity 
      style={styles.reloadButton} 
      onPress={onReload}
      activeOpacity={0.7}
    >
      <Ionicons name="refresh-outline" size={20} color="#FFFFFF" style={styles.reloadIcon} />
      <Text style={styles.reloadButtonText}>Yeniden Yükle</Text>
    </TouchableOpacity>
  </View>
);
// API Service
const ictihatService = {
  fetchInitialPdfs: async () => {
    try {
      const response = await fetch('https://api.hukukchat.com/pdfs/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Sunucu hatası: ' + response.status);
      }

      return await response.json();

    } catch (error) {
      console.error('Emsal kararlar alınırken hata oluştu:', error);
      throw error;
    }
  },

  searchIctihat: async (searchText) => {
    try {
      const response = await fetch('https://api.hukukchat.com/search_and_filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: searchText,
          selectedTexts: [],
          scroll_id: ""
        })
      });
  
      if (!response.ok) {
        throw new Error('Sunucu hatası: ' + response.status);
      }
  
      return await response.json();
    } catch (error) {
      console.error('İctihat listesi alınırken hata oluştu:', error);
      throw error;
    }
  },

  getPdfUrlByFilename: (filename) => {
    return `https://api.hukukchat.com/get-pdf/${filename}`;
  }
};

// Main Component
const Ictihat = ({ navigation }) => {
  // States
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [ictihatList, setIctihatList] = useState([]);
  const [selectedIctihat, setSelectedIctihat] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [scrollId, setScrollId] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info'
  });
  
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

  // Handle select ictihat
  const handleSelectIctihat = async (filename) => {
    setPdfLoading(true);
    setSelectedIctihat(filename);
    
    try {
      const url = ictihatService.getPdfUrlByFilename(filename);
      
      // Debug
      console.log('İçtihat Seçildi - İstek Bilgileri:');
      console.log('İçtihat Filename:', filename);
      console.log('İstek URL:', url);
      
      // Set PDF URL and show modal
      setPdfUrl(url);
      setModalVisible(true);
    } catch (error) {
      console.error('PDF alınırken hata:', error);
      showToast('PDF alınırken bir hata oluştu', 'error');
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const data = await ictihatService.fetchInitialPdfs();
      setIctihatList(data.results || []);
      setScrollId(data.scroll_id);
      setTotalDocs(data.total_docs);
    } catch (error) {
      showToast('Emsal kararlar alınırken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchText.trim()) {
      showToast('Lütfen arama metni giriniz', 'warning');
      return;
    }

    setLoading(true);
    setSelectedIctihat(null);
    setPdfUrl(null);
    setModalVisible(false);

    try {
      const data = await ictihatService.searchIctihat(searchText);
      setIctihatList(data.results || []);
      
      if (data.results && data.results.length > 0) {
        showToast(`${data.results.length} içtihat bulundu`, 'success');
      } else {
        showToast('Aramanıza uygun içtihat bulunamadı', 'info');
      }
    } catch (error) {
      showToast('İçtihat listesi alınırken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Show info popup
  const showInfoPopup = () => {
    showToast('İçtihatlarınızı arayabilir ve detaylarını inceleyebilirsiniz', 'info');
  };

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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="arrow-back" size={24} color="#193353" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İçtihat Araştırma</Text>
        <TouchableOpacity style={styles.infoButton} onPress={showInfoPopup}>
          <Ionicons name="information-circle-outline" size={24} color="#193353" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <SearchBar 
        searchText={searchText}
        setSearchText={setSearchText}
        loading={loading}
        handleSearch={handleSearch}
      />

      {/* Stats display */}
      {totalDocs > 0 && !loading && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Toplam {totalDocs.toLocaleString('tr-TR')} adet içtihat bulundu
          </Text>
        </View>
      )}

      {/* Main Content - İçtihat Listesi */}
     {/* Main Content - İçtihat Listesi */}
<View style={styles.fullWidthContent}>
  {loading ? (
    <View style={styles.loadingContainer}>
      <Wave size={48} color="#4A90E2" />
      <Text style={styles.loadingText}>İçtihatlar yükleniyor...</Text>
    </View>
  ) : ictihatList.length > 0 ? (
    <FlatList
      data={ictihatList}
      renderItem={({ item }) => (
        <IctihatListItem 
          item={item} 
          isSelected={selectedIctihat === item.filename}
          onSelect={handleSelectIctihat}
        />
      )}
      keyExtractor={(item, index) => `${item.id || item.filename || index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  ) : (
    <EmptyState 
      message="İçtihat bulunamadı. Lütfen yeniden yüklemeyi deneyin." 
      onReload={loadInitialData}
    />
  )}
</View>

      {/* WebView PDF Görüntüleyici Modal */}
      {pdfUrl && (
        <PdfViewerModal 
          pdfUrl={pdfUrl}
          visible={modalVisible}
          onClose={closeModal}
          loading={pdfLoading}
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F0FB',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A5F',
    paddingVertical: 8,
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#E6F0FB',
  },
  // Add these to your styles
reloadButton: {
  backgroundColor: '#4A90E2',
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 20,
  shadowColor: '#4A90E2',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 2,
  minWidth: 160,
},
reloadButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},
reloadIcon: {
  marginRight: 8,
},
  statsText: {
    fontSize: 12,
    color: '#193353',
    fontStyle: 'italic',
  },
  fullWidthContent: {
    flex: 1,
    padding: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  ictihatItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  selectedIctihatItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    backgroundColor: '#F0F4F9',
  },
  ictihatItemContent: {
    flex: 1,
  },
  ictihatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
    marginBottom: 6,
  },
  ictihatCourt: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 6,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    fontSize: 12,
    color: '#6B7C93',
    marginLeft: 6,
    flex: 1,
  },
  arrowContainer: {
    backgroundColor: '#E6F0FB',
    padding: 8,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#193353',
  },
  emptyListText: {
    marginTop: 8,
    color: '#6B7C93',
    textAlign: 'center',
    fontSize: 14,
    maxWidth: '80%',
  },
  pdfLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    color: '#1E3A5F',
    fontSize: 14,
  },
  // Modal Styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F0FB',
    elevation: 2,
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
  externalButton: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  webView: {
    flex: 1,
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
  },
  errorText: {
    marginTop: 8,
    color: '#6B7C93',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
    maxWidth: '80%',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  toastMessage: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 12,
  }
});

export default Ictihat;