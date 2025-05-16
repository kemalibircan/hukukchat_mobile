import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '../../../functions/DateTimePicker';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the LoadingAnimation and SonucModal components
import LoadingAnimation from '../../../functions/LoadingAnimation';
import SonucModal from './SonucModal';
import { useSelector } from 'react-redux';
import { selectUserName } from '../../../slices/userSlices';
import { selectSignIn } from '../../../slices/authSlices';

const TrafikKazasiTazminati = () => {
  const [fullName, setFullName] = useState('');
  const [tcNumber, setTcNumber] = useState('');
  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1));
  const [accidentDate, setAccidentDate] = useState(new Date());
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [reportDate, setReportDate] = useState(new Date());
  const [insuranceDate, setInsuranceDate] = useState(new Date());
  const [insuranceReportDate, setInsuranceReportDate] = useState(new Date());
  const [retirementAge, setRetirementAge] = useState('65');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [disabilityRate, setDisabilityRate] = useState('');
  const [gender, setGender] = useState('male');
  const [isDeceased, setIsDeceased] = useState(false);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [childrenCount, setChildrenCount] = useState('0');
  const [faultRate, setFaultRate] = useState('0');
  const [accidentType, setAccidentType] = useState('singleVehicle');
  const FASTAPI_URL = "https://api.hukukchat.com";
  const [loading, setLoading] = useState(false);
  const username = useSelector(selectUserName);
  const token = useSelector(selectSignIn);
  const [result, setResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // For SonucModal

  // Safe number formatting - returns 0 if value is undefined or NaN
  const safeNumberFormat = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0.00";
    }
    return Number(value).toFixed(decimals);
  };

  const hesaplaTrafikTazminat = async (formData) => {
    try {
      console.log("İstek gönderiliyor:", formData); // Debug için
      
      const response = await fetch(`${FASTAPI_URL}/api/hesapla/tazminat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token || ''}`,
        },
        body: JSON.stringify(formData), // Tüm form verisini gönder
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Trafik tazminat hesaplama isteği başarısız.");
      }
      
      console.log("API'dan gelen yanıt:", response); // Debug için
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error("Trafik kazası tazminat hatası:", error);
      throw error;
    }
  };

  const handleReportDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setReportDate(selectedDate);
    }
  };
  
  const handleInsuranceDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setInsuranceDate(selectedDate);
    }
  };
  
  const handleInsuranceReportDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setInsuranceReportDate(selectedDate);
    }
  };

  const handleBirthDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleAccidentDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setAccidentDate(selectedDate);
    }
  };



  const calculate = async () => {
    // Form validation
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Adı Soyadı alanı zorunludur.');
      return;
    }
  
    if (!tcNumber.trim() || tcNumber.length !== 11) {
      Alert.alert('Hata', 'TC Kimlik Numarası 11 haneli olmalıdır.');
      return;
    }
  
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      Alert.alert('Hata', 'Geçerli bir aylık gelir girmelisiniz.');
      return;
    }
  
    if (isDeceased === false && (!disabilityRate || parseFloat(disabilityRate) <= 0 || parseFloat(disabilityRate) > 100)) {
      Alert.alert('Hata', 'Geçerli bir maluliyet oranı girmelisiniz (1-100 arası).');
      return;
    }
  
    const faultRateValue = parseInt(faultRate);
    if (isNaN(faultRateValue) || faultRateValue < 0 || faultRateValue > 100) {
      Alert.alert('Hata', 'Geçerli bir kusur oranı girmelisiniz (0-100 arası).');
      return;
    }
  
    setLoading(true);
  
    try {
      const today = new Date();
      
      // API'nin gerektirdiği tüm alanları ekleyelim
      const formData = {
        // Temel kişisel bilgiler
        adSoyad: fullName,
        tcKimlik: tcNumber,
        dogumTarihi: format(birthDate, 'yyyy-MM-dd'),
        kazaTarihi: format(accidentDate, 'yyyy-MM-dd'),
        gelirDurumu: parseFloat(monthlyIncome) || 0,
        cinsiyet: gender === 'male' ? 'erkek' : 'kadin',
        
        // API'nin gerektirdiği ek alanlar
        sigortaNo: insuranceNumber || "12345", // Default değer
        sigortaTanımTarihi: format(insuranceDate, 'yyyy-MM-dd'),
        raporTarihi: format(reportDate, 'yyyy-MM-dd'),
        sigortaIhbar: format(insuranceReportDate, 'yyyy-MM-dd'),
        emeklilikYasi: parseInt(retirementAge) || 65,
        
        // Kaza bilgileri
        kazaTuru: isDeceased ? "olumlu" : "yaralanmali",
        kazaKategorisi: "Trafik",
        kusurOrani: parseInt(faultRate) || 0,
        maluliyetOrani: isDeceased ? 0 : parseFloat(disabilityRate) || 0,
        
        // Yasal ayarlar
        yasamTablosu: "PMF 1931 Yaşam Tablosu",
        formul: "Progresif Rant Formülü",
        
        // Medeni hal durumu - API her durumda istiyor
        medeniHali: isDeceased ? (hasSpouse ? "evli" : "bekar") : "bekar",
        
        // Kullanıcı bilgisi
        user_id: username || "",
      };
      
      // Ölümlü kaza ise aile bilgilerini ekle
      if (isDeceased) {
        formData.cocukVarMi = parseInt(childrenCount) > 0 ? "evet" : "hayir";
        formData.children_count = parseInt(childrenCount) || 0;
        
        if (hasSpouse) {
          formData.esDogumTarihi = format(today, 'yyyy-MM-dd'); // Eş doğum tarihi
          formData.esMahsupOdeme = "0"; // Default değer
          formData.esMahsupOdemeTarihi = format(today, 'yyyy-MM-dd'); // Default değer
        }
      }
      
      // API çağrısını yap
      const apiResult = await hesaplaTrafikTazminat(formData);
      

      // Result state'ini güncelle
      if (apiResult) {
        const formattedResult = {
          result: apiResult.report_text || JSON.stringify(apiResult)
        };
        
        setResult(formattedResult);

        setModalVisible(true);
      } else {
        throw new Error("API sonucu boş veya geçersiz.");
      }
    } catch (error) {
      Alert.alert('Hata', `Bağlantı hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setTcNumber('');
    setBirthDate(new Date(1990, 0, 1));
    setAccidentDate(new Date());
    setMonthlyIncome('');
    setDisabilityRate('');
    setGender('male');
    setIsDeceased(false);
    setHasSpouse(false);
    setChildrenCount('0');
    setFaultRate('0');
    setAccidentType('singleVehicle');
    setResult(null);
    
    // Yeni alanları sıfırla
    setReportDate(new Date());
    setInsuranceDate(new Date());
    setInsuranceReportDate(new Date());
    setRetirementAge('65');
    setInsuranceNumber('');
  };

  // Helper function to safely render result values
  const renderResultValue = (value) => {
    if (value === undefined || value === null) {
      return "0.00 ₺";
    }
    return `${safeNumberFormat(value)} ₺`;
  };

  // Helper function to safely get nested values
  const safeGetNestedValue = (obj, path, defaultValue = null) => {
    try {
      const keys = path.split('.');
      let current = obj;
      
      for (const key of keys) {
        if (current === null || current === undefined) {
          return defaultValue;
        }
        current = current[key];
      }
      
      return current !== undefined ? current : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Trafik Kazası Tazminatı Hesaplama</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Adı Soyadı</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Kazaya uğrayan kişinin adı soyadı"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>TC Kimlik Numarası</Text>
        <TextInput
          style={styles.input}
          value={tcNumber}
          onChangeText={setTcNumber}
          placeholder="TC Kimlik Numarası"
          keyboardType="numeric"
          maxLength={11}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Doğum Tarihi</Text>
        <DateTimePicker
          value={birthDate}
          onChange={handleBirthDateChange}
          maximumDate={new Date()}
        />
      </View>
      
      {/* Sigorta ve Rapor Bilgileri */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Sigorta Poliçe Numarası</Text>
        <TextInput
          style={styles.input}
          value={insuranceNumber}
          onChangeText={setInsuranceNumber}
          placeholder="Sigorta poliçe numarası"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Poliçe Tanzim Tarihi</Text>
        <DateTimePicker
          value={insuranceDate}
          onChange={handleInsuranceDateChange}
          maximumDate={new Date()}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Sigortalı İhbar Tarihi</Text>
        <DateTimePicker
          value={insuranceReportDate}
          onChange={handleInsuranceReportDateChange}
          maximumDate={new Date()}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Rapor Düzenleme Tarihi</Text>
        <DateTimePicker
          value={reportDate}
          onChange={handleReportDateChange}
          maximumDate={new Date()}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Emeklilik Yaşı</Text>
        <TextInput
          style={styles.input}
          value={retirementAge}
          onChangeText={setRetirementAge}
          placeholder="Emeklilik yaşı"
          keyboardType="numeric"
          maxLength={2}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kaza Tarihi</Text>
        <DateTimePicker
          value={accidentDate}
          onChange={handleAccidentDateChange}
          maximumDate={new Date()}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kaza Türü</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setAccidentType('singleVehicle')}
          >
            <View style={[styles.radioButton, accidentType === 'singleVehicle' && styles.radioButtonSelected]}>
              {accidentType === 'singleVehicle' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Tek Araçlı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setAccidentType('multiVehicle')}
          >
            <View style={[styles.radioButton, accidentType === 'multiVehicle' && styles.radioButtonSelected]}>
              {accidentType === 'multiVehicle' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Çok Araçlı</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kusur Oranı (%)</Text>
        <TextInput
          style={styles.input}
          value={faultRate}
          onChangeText={setFaultRate}
          placeholder="Karşı tarafın kusur oranı (0-100)"
          keyboardType="numeric"
          maxLength={3}
        />
        <Text style={styles.helperText}>
          Karşı tarafın kusur oranı. Örneğin, %80 kusurlu ise 80 yazınız.
        </Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Aylık Gelir (Brüt)</Text>
        <TextInput
          style={styles.input}
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
          placeholder="Aylık brüt gelir miktarı"
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Cinsiyet</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setGender('male')}
          >
            <View style={[styles.radioButton, gender === 'male' && styles.radioButtonSelected]}>
              {gender === 'male' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Erkek</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setGender('female')}
          >
            <View style={[styles.radioButton, gender === 'female' && styles.radioButtonSelected]}>
              {gender === 'female' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Kadın</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kaza sonucu vefat var mı?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setIsDeceased(true)}
          >
            <View style={[styles.radioButton, isDeceased && styles.radioButtonSelected]}>
              {isDeceased && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Evet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setIsDeceased(false)}
          >
            <View style={[styles.radioButton, !isDeceased && styles.radioButtonSelected]}>
              {!isDeceased && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Hayır</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {!isDeceased ? (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Maluliyet Oranı (%)</Text>
          <TextInput
            style={styles.input}
            value={disabilityRate}
            onChangeText={setDisabilityRate}
            placeholder="Maluliyet oranını giriniz (1-100)"
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Eş var mı?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setHasSpouse(true)}
              >
                <View style={[styles.radioButton, hasSpouse && styles.radioButtonSelected]}>
                  {hasSpouse && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Evet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setHasSpouse(false)}
              >
                <View style={[styles.radioButton, !hasSpouse && styles.radioButtonSelected]}>
                  {!hasSpouse && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Hayır</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Çocuk Sayısı</Text>
            <TextInput
              style={styles.input}
              value={childrenCount}
              onChangeText={setChildrenCount}
              placeholder="Çocuk sayısı"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </>
      )}
      
      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
          <Text style={styles.resetButtonText}>Sıfırla</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.calculateButton} 
          onPress={calculate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
              <Text style={styles.calculateButtonText}>Hesapla</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Animasyonlu Loading Ekranı */}
      <LoadingAnimation
        visible={loading}
        title="Hesaplama Yapılıyor"
        message="Tazminat hesaplaması yapılıyor, lütfen bekleyiniz..."
        ballColors={{
          ball1: '#D77A25',
          ball2: '#4A90E2',
          ball3: '#193353'
        }}
      />
      
      {/* Sonuç Modalı */}
      {result && (
       <SonucModal 
       visible={modalVisible}
       title="Trafik Kazası Tazminat Hesaplama Sonucu"
       onClose={() => setModalVisible(false)}
       result={result} // Now passing the formatted result object
     />
      )}
      
      {/* Sonuçlar - Direkt ekran üzerinde gösterilen */}
      {result && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Hesaplama Sonucu</Text>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Kusur Oranı:</Text>
            <Text style={styles.resultValue}>%{result.kusur_orani || 0}</Text>
          </View>
          
          {isDeceased ? (
            <>
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Destekten Yoksun Kalma Tazminatı</Text>
                
                {hasSpouse && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Eş için:</Text>
                    <Text style={styles.resultValue}>
                      {renderResultValue(safeGetNestedValue(result, 'destekten_yoksun_kalma.spouse'))}
                    </Text>
                  </View>
                )}
                
                {parseInt(childrenCount) > 0 && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Çocuklar için:</Text>
                    <Text style={styles.resultValue}>
                      {renderResultValue(safeGetNestedValue(result, 'destekten_yoksun_kalma.children'))}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Tazminat Detayları</Text>
                
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Maddi Tazminat:</Text>
                  <Text style={styles.resultValue}>
                    {renderResultValue(result.maddi_tazminat)}
                  </Text>
                </View>
                
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Manevi Tazminat:</Text>
                  <Text style={styles.resultValue}>
                    {renderResultValue(result.manevi_tazminat)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Tazminat Detayları</Text>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>İş Gücü Kayıp Oranı:</Text>
                <Text style={styles.resultValue}>
                  %{safeNumberFormat(result.is_gucu_kayip_orani || 0)}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Maddi Tazminat:</Text>
                <Text style={styles.resultValue}>
                  {renderResultValue(result.maddi_tazminat)}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Manevi Tazminat:</Text>
                <Text style={styles.resultValue}>
                  {renderResultValue(result.manevi_tazminat)}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.resultTotal}>
            <Text style={styles.resultTotalLabel}>TOPLAM TAZMİNAT:</Text>
            <Text style={styles.resultTotalValue}>
              {renderResultValue(result.total_amount)}
            </Text>
          </View>
          
          <Text style={styles.disclaimer}>
            Bu hesaplamalar yaklaşık değerlerdir ve resmi bilgi niteliğinde değildir.
            Hukuki işlemleriniz için mutlaka bir avukata danışınız.
          </Text>
          <TouchableOpacity
            style={styles.detailedReportButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
            <Text style={styles.detailedReportText}>Detaylı Raporu Görüntüle</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#193353',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#193353',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F0F4F8',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4A90E2',
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#4A90E2',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  calculateButton: {
    flex: 2,
    backgroundColor: '#D77A25',
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  resultContainer: {
    backgroundColor: '#F0F9F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 8,
    borderBottomColor: '#C8E6C9',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
    paddingBottom: 4,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 4,
  },
  resultLabel: {
    fontSize: 14,
    color: '#4CAF50',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  resultTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
    paddingVertical: 4,
  },
  resultTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  resultTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailedReportButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedReportText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TrafikKazasiTazminati;