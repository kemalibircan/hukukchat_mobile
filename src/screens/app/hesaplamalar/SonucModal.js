import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';

const SonucModal = ({ visible, onClose, result,title}) => {
  const [copied, setCopied] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Parse the API response
  const parseResponse = () => {
    if (!result || !result.result) return null;
    
    // Extract sections from the result string
    const sections = result.result.split('──────────────────────────────');
    
    // Extract important information
    const processedResult = {
      sections: sections.map(section => {
        section = section.trim();
        if (!section) return null;
        
        // Get section title and content
        const lines = section.split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();
        
        return { title, content };
      }).filter(section => section !== null)
    };
    
    return processedResult;
  };

  const parsedResult = parseResponse();

  const copyToClipboard = () => {
    if (!result) return;
    
    Clipboard.setString(result.result);
    setCopied(true);
    
    // Show animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setCopied(false));
  };

  const shareResult = async () => {
    if (!result) return;
    
    try {
      await Share.share({
        message: result.result,
        title: 'İnfaz Hesaplama Sonucu'
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    }
  };

  if (!result) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#193353" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {parsedResult && parsedResult.sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionContent}>
                  {section.content.replace(/•/g, '•  ')}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]} 
              onPress={shareResult}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Paylaş</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.copyButton]} 
              onPress={copyToClipboard}
            >
              <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Kopyala</Text>
            </TouchableOpacity>
          </View>

          {/* Copy feedback animation */}
          <Animated.View 
            style={[
              styles.copyFeedback, 
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.copyFeedbackText}>Kopyalandı!</Text>
          </Animated.View>

          <Text style={styles.disclaimer}>
            Bu hesaplamalar yaklaşık değerlerdir ve resmi bilgi niteliğinde değildir.
            Hukuki işlemleriniz için mutlaka bir avukata danışınız.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
    backgroundColor: '#F8F9FC',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#193353',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: '70%',
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#F0F9F3',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  shareButton: {
    backgroundColor: '#4A90E2',
  },
  copyButton: {
    backgroundColor: '#D77A25',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  copyFeedback: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  copyFeedbackText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default SonucModal;