import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// Eski kütüphaneyi kullanmaya devam edelim, çünkü yeni kütüphane ile ilgili sorunlar var
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';

/**
 * DocumentPermission.js
 * 
 * Bu dosya, belge yükleme ve işleme ile ilgili izinleri yönetmek için
 * gerekli tüm fonksiyonları içerir. iOS ve Android platformları için
 * ayrı izin kontrolleri sağlar.
 */

/**
 * Cihaz tipine göre gerekli izinleri kontrol eder
 * @returns {Promise<boolean>} İzinler verildi mi?
 */
export const checkDocumentPermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      return await checkAndroidPermissions();
    } else if (Platform.OS === 'ios') {
      return await checkIosPermissions();
    }
    return true;
  } catch (error) {
    console.error('İzin kontrolü hatası:', error);
    return false;
  }
};

/**
 * Android cihazlar için gerekli dosya izinlerini kontrol eder
 * @returns {Promise<boolean>} İzinler verildi mi?
 */
const checkAndroidPermissions = async () => {
  try {
    // Android 13 (API 33) ve üstü için yeni izin modeli
    if (Platform.Version >= 33) {
      const readMediaPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      
      if (!readMediaPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Dosya Erişim İzni',
            message: 'Belgeleri yükleyebilmek için dosya erişim izni gereklidir.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showPermissionDeniedAlert();
          return false;
        }
      }
    } 
    // Android 10-12 (API 29-32) için izin kontrolü
    else if (Platform.Version >= 29) {
      const readStoragePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      
      if (!readStoragePermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Dosya Erişim İzni',
            message: 'Belgeleri yükleyebilmek için dosya erişim izni gereklidir.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showPermissionDeniedAlert();
          return false;
        }
      }
    } 
    // Android 9 (API 28) ve altı için 
    else {
      const readPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      const writePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      
      if (!readPermission || !writePermission) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];
        
        const grantResults = await PermissionsAndroid.requestMultiple(permissions);
        
        if (
          grantResults[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !== PermissionsAndroid.RESULTS.GRANTED ||
          grantResults[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          showPermissionDeniedAlert();
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Android izin kontrolü hatası:', error);
    return false;
  }
};

/**
 * iOS cihazlar için gerekli dosya izinlerini kontrol eder
 * @returns {Promise<boolean>} İzinler verildi mi?
 */
const checkIosPermissions = async () => {
  try {
    // iOS'ta dosya seçmek için özel bir izin gerekmez, ancak fotoğraf erişimi için izin gerekebilir
    // iOS 14+ için fotoğraf kitaplığı sınırlı erişim izni
    const photoLibraryPermission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    
    if (photoLibraryPermission === RESULTS.DENIED) {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (result !== RESULTS.GRANTED && result !== RESULTS.LIMITED) {
        // Sadece bilgilendirme amaçlı, dosya seçimi için zorunlu değil
        console.log('Fotoğraf kitaplığı erişimi reddedildi, ancak dosya seçimi için gerekli değil');
      }
    }
    
    return true;
  } catch (error) {
    console.error('iOS izin kontrolü hatası:', error);
    return false;
  }
};

/**
 * İzin reddedildiğinde kullanıcıya bilgi verir
 */
const showPermissionDeniedAlert = () => {
  Alert.alert(
    'İzin Gerekli',
    'Belgeleri yükleyebilmek için gerekli izinleri vermeniz gerekmektedir. Lütfen ayarlar kısmından uygulama izinlerini kontrol ediniz.',
    [
      { text: 'Tamam', style: 'default' }
    ]
  );
};

/**
 * Belge seçimi için izinleri kontrol eder ve belge seçiciyi açar
 * @param {Array} fileTypes - Kabul edilecek dosya türleri
 * @returns {Promise<Object|null>} Seçilen dosya veya null
 */
export const pickDocument = async (fileTypes = [
  DocumentPicker.types.pdf,
  DocumentPicker.types.doc,
  DocumentPicker.types.docx,
  DocumentPicker.types.plainText,
]) => {
  try {
    // Önce izinleri kontrol et
    const hasPermission = await checkDocumentPermissions();
    
    if (!hasPermission) {
      console.log('Gerekli izinler verilmedi');
      return null;
    }
    
    // Belge seçiciyi aç
    const result = await DocumentPicker.pick({
      type: fileTypes,
      allowMultiSelection: false,
    });
    
    if (result && result.length > 0) {
      return result[0]; // Seçilen dosyayı döndür
    }
    
    return null;
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      // Kullanıcı seçimi iptal etti, bir hata değil
      console.log('Kullanıcı belge seçimini iptal etti');
    } else {
      console.error('Belge seçim hatası:', error);
    }
    return null;
  }
};

/**
 * Dosya gerçek yolunu almak için (özellikle iOS'ta gerekli)
 * @param {string} uri - Dosya URI'si
 * @returns {Promise<string>} Gerçek dosya yolu
 */
export const getFileRealPath = async (uri) => {
  try {
    if (Platform.OS === 'ios') {
      // iOS için özel işlem
      let realPath = uri;
      if (uri.startsWith('file://')) {
        realPath = uri.substring(7);
      }
      return realPath;
    }
    
    // Android için RNFetchBlob kullanarak gerçek yolu al
    const stat = await RNFetchBlob.fs.stat(uri);
    return stat.path;
  } catch (error) {
    console.error('Dosya yolu alma hatası:', error);
    return uri; // Hata durumunda orijinal URI'yi döndür
  }
};

/**
 * Seçilen dosyanın boyut kontrolünü yapar
 * @param {Object} fileInfo - Dosya bilgileri
 * @param {number} maxSizeMB - İzin verilen maksimum boyut (MB cinsinden)
 * @returns {boolean} Dosya boyutu uygun mu?
 */
export const checkFileSize = (fileInfo, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (fileInfo && fileInfo.size > maxSizeBytes) {
    Alert.alert(
      'Dosya Çok Büyük',
      `Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır. Seçtiğiniz dosya: ${(fileInfo.size / (1024 * 1024)).toFixed(2)}MB`,
      [{ text: 'Tamam', style: 'default' }]
    );
    return false;
  }
  
  return true;
};

/**
 * Dosyanın geçerli bir tür olup olmadığını kontrol eder
 * @param {Object} fileInfo - Dosya bilgileri
 * @param {Array} allowedTypes - İzin verilen MIME türleri
 * @returns {boolean} Dosya türü uygun mu?
 */
export const checkFileType = (fileInfo, allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]) => {
  if (fileInfo && !allowedTypes.includes(fileInfo.type)) {
    Alert.alert(
      'Desteklenmeyen Dosya Türü',
      'Lütfen PDF, DOC, DOCX veya TXT formatında bir dosya seçin.',
      [{ text: 'Tamam', style: 'default' }]
    );
    return false;
  }
  
  return true;
};

/**
 * Belge yükleme işlemi için tam doğrulama ve seçim süreci
 * @param {number} maxSizeMB - İzin verilen maksimum boyut
 * @param {Array} allowedTypes - İzin verilen dosya türleri
 * @returns {Promise<Object|null>} Seçilen dosya veya null
 */
export const selectAndValidateDocument = async (
  maxSizeMB = 10,
  allowedTypes = [
    DocumentPicker.types.pdf,
    DocumentPicker.types.doc,
    DocumentPicker.types.docx,
    DocumentPicker.types.plainText,
  ]
) => {
  try {
    // Belge seç
    const pickedDocument = await pickDocument(allowedTypes);
    
    if (!pickedDocument) {
      return null;
    }
    
    // Dosya boyutu kontrolü
    if (!checkFileSize(pickedDocument, maxSizeMB)) {
      return null;
    }
    
    // Dosya türü kontrolü
    if (!checkFileType(pickedDocument, allowedTypes.map(type => {
      // DocumentPicker.types'tan MIME türüne dönüştür
      switch (type) {
        case DocumentPicker.types.pdf: return 'application/pdf';
        case DocumentPicker.types.doc: return 'application/msword';
        case DocumentPicker.types.docx: return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case DocumentPicker.types.plainText: return 'text/plain';
        default: return type;
      }
    }))) {
      return null;
    }
    
    return pickedDocument;
  } catch (error) {
    console.error('Belge seçim ve doğrulama hatası:', error);
    return null;
  }
};

export default {
  checkDocumentPermissions,
  pickDocument,
  getFileRealPath,
  checkFileSize,
  checkFileType,
  selectAndValidateDocument,
};