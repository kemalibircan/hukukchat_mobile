import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
              onPress={handlePreview}
            >
              <Ionicons name="eye-outline" size={22} color="#4A90E2" />
            </TouchableOpacity>
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

const styles = StyleSheet.create({
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
});

export default FileUploadCard;