import DocumentPicker from 'react-native-document-picker';
import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';

/**
 * Belge seçme fonksiyonu - iOS ve Android için optimize edilmiş
 * @param {Array} currentFileArray - Mevcut dosya dizisi
 * @param {Function} onFileArrayChange - Dosya dizisi değiştiğinde çağrılacak fonksiyon
 * @returns {Object} İşlem sonucu
 */
export const pickDocument = async (currentFileArray, onFileArrayChange) => {
  try {
    // Sistem bilgileri için loglama
    console.log('Sistem bilgileri:', {
      os: Platform.OS,
      version: Platform.Version,
      apiLevel: Platform.OS === 'android' ? Platform.Version : 'iOS ' + Platform.Version
    });

    // İzinleri kontrol et
    console.log('İzin kontrolü başladı');
    await checkPermissions();
    console.log('İzin kontrolü tamamlandı');
    
    // Dosya seçici için platform bazlı yapılandırmalar
    console.log('Dosya seçici başlatılıyor');
    const options = {
      type: [
        DocumentPicker.types.pdf,
        DocumentPicker.types.plainText,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx,
      ],
      allowMultiSelection: false,
      presentationStyle: 'fullScreen', // iOS için tam ekran gösterimi
    };
    
    // iOS ve eski Android sürümleri için cache dizinine kopyalama
    if (Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version < 30)) {
      options.copyTo = 'cachesDirectory';
    }
    
    // Android için dosya seçici sorunlarına karşı önlem
    if (Platform.OS === 'android') {
      options.mode = 'open'; // Android'de dosyayı direkt açma modu
    }
    
    const result = await DocumentPicker.pick(options);
    console.log('Dosya seçici sonucu:', result);

    // Seçilen dosyayı işle
    const newFile = {
      name: result[0].name,
      type: result[0].type,
      size: result[0].size,
      uri: result[0].uri,
      // iOS ve Android için farklı URI formatı işlemi
      fileCopyUri: result[0].fileCopyUri || result[0].uri
    };
    
    console.log('İşlenen dosya:', newFile);

    // Dosya boyutu kontrolü
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (newFile.size > MAX_FILE_SIZE) {
      Alert.alert('Uyarı', 'Dosya boyutu 10MB\'ı geçemez.');
      return { error: new Error('Dosya boyutu limiti aşıldı') };
    }

    // Dosya erişimini ve okunabilirliğini doğrula
    try {
      // Platform bazlı URI düzenlemesi
      let fileUriToCheck;
      
      if (Platform.OS === 'ios') {
        // iOS'ta fileCopyUri veya uri'yi kullan ve file:// önekini düzenle
        fileUriToCheck = (newFile.fileCopyUri || newFile.uri).replace(/^file:\/\//, '');
      } else {
        // Android için direkt URI'yi kullan
        fileUriToCheck = newFile.uri;
        
        // Android URI tipine göre content:// ise özel işlem gerekebilir
        if (fileUriToCheck.startsWith('content://')) {
          // content:// URI için dosya varoluş kontrolü yapma, DocumentPicker zaten erişim sağlamış olmalı
          console.log('Android content URI tespit edildi, varoluş kontrolü atlanıyor');
        }
      }
      
      console.log('Dosya erişimi kontrol ediliyor:', fileUriToCheck);
      
      // Dosya varsa ve text dosyasıysa oku
      if (newFile.type === 'text/plain' && !fileUriToCheck.startsWith('content://')) {
        try {
          await RNFS.read(fileUriToCheck, 10, 0, 'utf8');
          console.log('Metin dosyası başarıyla okundu');
        } catch (readError) {
          console.warn('Metin dosyası okunamadı, ancak işleme devam ediliyor:', readError);
        }
      }
      
      console.log('Dosya erişimi kontrolü tamamlandı');
    } catch (fileAccessError) {
      console.warn('Dosya erişim kontrolü hatası:', fileAccessError);
      console.log('Dosya seçildi ancak erişim kontrolü başarısız oldu - yine de devam ediliyor');
    }

    // Dosyayı diziye ekle
    const updatedFileArray = [...currentFileArray, newFile];
    console.log('Dosya diziye ekleniyor, yeni toplam:', updatedFileArray.length);
    onFileArrayChange(updatedFileArray);
    return { success: true, file: newFile };

  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('Kullanıcı dosya seçimini iptal etti');
      return { error: new Error('Kullanıcı iptal etti') };
    } else {
      console.error('Dosya seçme hatası:', err);
      let errorMessage = 'Dosya seçilirken bir hata oluştu';
      
      if (err.message) {
        errorMessage += ': ' + err.message;
      }
      
      Alert.alert('Hata', errorMessage);
      return { error: err };
    }
  }
};

/**
 * Platform bazlı izin kontrolü
 */
const checkPermissions = async () => {
  // iOS için foto kütüphanesi izinleri gerekli değil, dosya seçici zaten erişim sağlıyor
  if (Platform.OS === 'ios') {
    console.log('iOS platformu için harici izin gerekmiyor');
    return Promise.resolve(true);
  }
  
  // Android için izin kontrolü
  try {
    // Android 13+ için yeni izin modeli
    if (Platform.Version >= 33) {
      console.log('Android 13+ için izinler kontrol ediliyor');
      const permissions = [
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, 
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
      ];
      
      let allGranted = true;
      
      for (const permission of permissions) {
        console.log(`${permission} izni kontrol ediliyor`);
        const result = await check(permission);
        console.log(`${permission} izin durumu: ${result}`);
        
        if (result === RESULTS.DENIED) {
          console.log(`${permission} izni isteniyor`);
          const requestResult = await request(permission);
          console.log(`${permission} izin isteği sonucu: ${requestResult}`);
          
          if (requestResult !== RESULTS.GRANTED) {
            allGranted = false;
            console.log(`${permission} izni verilmedi`);
          }
        } else if (result !== RESULTS.GRANTED) {
          allGranted = false;
        }
      }
      
      if (!allGranted) {
        console.log('Bazı izinler verilmedi, ancak dosya seçici yine de çalışabilir');
      }
    } 
    // Android 12 ve altı için eski izin modeli
    else {
      console.log('Android 12 ve altı için izin kontrol ediliyor');
      const permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      const result = await check(permission);
      console.log(`READ_EXTERNAL_STORAGE izin durumu: ${result}`);
      
      if (result === RESULTS.DENIED) {
        console.log('READ_EXTERNAL_STORAGE izni isteniyor');
        const requestResult = await request(permission);
        console.log(`READ_EXTERNAL_STORAGE izin isteği sonucu: ${requestResult}`);
        
        if (requestResult !== RESULTS.GRANTED) {
          console.log('READ_EXTERNAL_STORAGE izni verilmedi, ancak dosya seçici yine de çalışabilir');
        }
      }
      
      // Android 10 ve altı için yazma izni gerekebilir bazı durumlarda
      if (Platform.Version < 29) {
        const writePermission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
        const writeResult = await check(writePermission);
        
        if (writeResult === RESULTS.DENIED) {
          await request(writePermission);
        }
      }
    }
    
    return Promise.resolve(true);
  } catch (error) {
    console.error('İzin kontrolü hatası:', error);
    // İzin hatasına rağmen devam et, DocumentPicker kendi izin sistemini kullanabilir
    return Promise.resolve(false);
  }
};

/**
 * Seçili dosyayı kaldırma fonksiyonu
 * @param {number} index - Kaldırılacak dosyanın dizideki indeksi
 * @param {Array} fileArray - Mevcut dosya dizisi
 * @param {Function} onFileArrayChange - Dosya dizisi değiştiğinde çağrılacak fonksiyon
 */
export const removeFile = (index, fileArray, onFileArrayChange) => {
  console.log(`Dosya kaldırılıyor, indeks: ${index}, mevcut dosya sayısı: ${fileArray.length}`);
  const newFileArray = fileArray.filter((_, i) => i !== index);
  console.log(`Dosya kaldırıldı, yeni dosya sayısı: ${newFileArray.length}`);
  onFileArrayChange(newFileArray);
  
  // Kaldırılan dosyaya ait önbellek dosyasını temizle
  if (fileArray[index] && fileArray[index].fileCopyUri) {
    try {
      const fileUri = fileArray[index].fileCopyUri.replace('file://', '');
      RNFS.exists(fileUri)
        .then(exists => {
          if (exists) {
            RNFS.unlink(fileUri)
              .then(() => console.log('Önbellek dosyası başarıyla silindi'))
              .catch(err => console.warn('Önbellek dosyası silinemedi:', err));
          }
        })
        .catch(err => console.warn('Dosya kontrolü yapılamadı:', err));
    } catch (err) {
      console.warn('Önbellek temizleme hatası:', err);
    }
  }
};