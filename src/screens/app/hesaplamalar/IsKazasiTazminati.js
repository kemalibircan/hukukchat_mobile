import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Import custom components
import DateTimePicker from '../../../functions/DateTimePicker';
import LoadingAnimation from '../../../functions/LoadingAnimation';
import SonucModal from './SonucModal';
import { useSelector } from 'react-redux';
import { selectUserName } from '../../../slices/userSlices';
import { selectSignIn } from '../../../slices/authSlices';

const FASTAPI_URL =  'https://api.hukukchat.com';

const IsKazasiTazminati = () => {
  // Temel Bilgiler
  const [selectedOption, setSelectedOption] = useState('yaralanmali');
  const [fullName, setFullName] = useState('');
  const [tcNumber, setTcNumber] = useState('');
  const [sigortaNo, setSigortaNo] = useState('');
  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1));
  const [accidentDate, setAccidentDate] = useState(new Date());
  const [reportDate, setReportDate] = useState(new Date());
  const [sigortaTanzimDate, setSigortaTanzimDate] = useState(new Date());
  const [sigortaIhbarDate, setSigortaIhbarDate] = useState(new Date());
  
  // Gelir ve Kusur Bilgileri
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [faultRate, setFaultRate] = useState('0');
  const [retirementAge, setRetirementAge] = useState('65');
  
  // Demografik Bilgiler
  const [gender, setGender] = useState('erkek');

  // Formül Seçenekleri
  const [lifeTable, setLifeTable] = useState('PMF 1931 Yaşam Tablosu');
  const [formula, setFormula] = useState('Progresif Rant Formülü');
  const [teknikFaiz, setTeknikFaiz] = useState('1.8');
  
  // Vefat Durumu ve Yaralanma Bilgileri
  const [disabilityRate, setDisabilityRate] = useState('');
  const [geciciIsGormezlik, setGeciciIsGormezlik] = useState('');
  const [bakici, setBakici] = useState('');
  
  // Aile Bilgileri
  const [evli, setEvli] = useState('');
  const [anneBaba, setAnneBaba] = useState('');
  const [cocuk, setCocuk] = useState('');
  const [cocuklar, setCocuklar] = useState([]);
  const [currentCocuk, setCurrentCocuk] = useState({
    cinsiyet: "Erkek",
    dogumTarihi: new Date().toISOString().split('T')[0],
    egitimDurumu: "Okumuyor",
    omurBoyuBakim: "Evet",
    tutar: "0"
  });
  
  // Eş Bilgileri
  const [esDogumTarihi, setEsDogumTarihi] = useState(new Date(1990, 0, 1));
  const [esMahsupOdeme, setEsMahsupOdeme] = useState('');
  const [esMahsupOdemeTarihi, setEsMahsupOdemeTarihi] = useState(new Date());
  
  // Anne Baba Bilgileri
  const [anneDogumTarihi, setAnneDogumTarihi] = useState(new Date(1960, 0, 1));
  const [anneMahsupOdeme, setAnneMahsupOdeme] = useState('');
  const [anneMahsupOdemeTarihi, setAnneMahsupOdemeTarihi] = useState(new Date());
  const [babaDogumTarihi, setBabaDogumTarihi] = useState(new Date(1960, 0, 1));
  const [babaMahsupOdeme, setBabaMahsupOdeme] = useState('');
  const [babaMahsupOdemeTarihi, setBabaMahsupOdemeTarihi] = useState(new Date());
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  
  // Redux State
  const username = useSelector(selectUserName);
  const token = useSelector(selectSignIn);
  
  // Tarih işleyicileri
  const handleDateChange = (date, setDate) => {
    if (date) {
      setDate(date);
    }
  };
  
  // Çocuk ekleme fonksiyonu
  const handleAddCocuk = () => {
    if (
      currentCocuk.cinsiyet &&
      currentCocuk.dogumTarihi &&
      currentCocuk.egitimDurumu &&
      currentCocuk.omurBoyuBakim
    ) {
      setCocuklar([...cocuklar, currentCocuk]);
      setCurrentCocuk({
        cinsiyet: "Erkek",
        dogumTarihi: new Date().toISOString().split('T')[0],
        egitimDurumu: "Okumuyor",
        omurBoyuBakim: "Evet",
        tutar: "0"
      });
      setShowChildForm(false);
    } else {
      Alert.alert("Hata", "Lütfen çocuk bilgilerinin tamamını doldurun.");
    }
  };
  
  // Form doğrulama
  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Ad Soyad alanı zorunludur.');
      return false;
    }
    
    if (selectedOption === 'yaralanmali' && (!disabilityRate || parseFloat(disabilityRate) <= 0 || parseFloat(disabilityRate) > 100)) {
      Alert.alert('Hata', 'Geçerli bir maluliyet oranı girmelisiniz (1-100 arası).');
      return false;
    }
    
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      Alert.alert('Hata', 'Geçerli bir gelir miktarı girmelisiniz.');
      return false;
    }
    
    return true;
  };
  
  // Hesaplama fonksiyonu - API isteği
  const calculate = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    const formatDate = (date) => {
      return date instanceof Date ? format(date, 'yyyy-MM-dd') : date;
    };
    
    const requestBody = {
      // Temel bilgiler
      kazaTuru: selectedOption,
      adSoyad: fullName,
      tcKimlik: tcNumber,
      sigortaNo: sigortaNo,
      raporTarihi: formatDate(reportDate),
      sigortaTanımTarihi: formatDate(sigortaTanzimDate),
      sigortaIhbar: formatDate(sigortaIhbarDate),
      kazaTarihi: formatDate(accidentDate),
      dogumTarihi: formatDate(birthDate),
      gelirDurumu: monthlyIncome,
      kusurOrani: faultRate,
      emeklilikYasi: retirementAge,
      cinsiyet: gender,
      
      // Formül seçenekleri
      yasamTablosu: lifeTable,
      formul: formula,
      teknikFaiz: teknikFaiz,
      
      // Yaralanma bilgileri
      geciciIsGormezlik: geciciIsGormezlik,
      bakici: bakici,
      
      // Aile bilgileri
      medeniHali: evli,
      anneBaba: anneBaba,
      cocukVarMi: cocuk,
      
      // Eş bilgileri
      esDogumTarihi: formatDate(esDogumTarihi),
      esMahsupOdeme: esMahsupOdeme,
      esMahsupOdemeTarihi: formatDate(esMahsupOdemeTarihi),
      
      // Anne baba bilgileri
      anneDogumTarihi: formatDate(anneDogumTarihi),
      anneMahsupOdeme: anneMahsupOdeme,
      anneMahsupOdemeTarihi: formatDate(anneMahsupOdemeTarihi),
      babaDogumTarihi: formatDate(babaDogumTarihi),
      babaMahsupOdeme: babaMahsupOdeme,
      babaMahsupOdemeTarihi: formatDate(babaMahsupOdemeTarihi),
      
      // Çocuk bilgileri
      cocuklar: cocuklar.map(cocuk => ({
        ...cocuk,
        dogumTarihi: formatDate(cocuk.dogumTarihi)
      })),
      
      // Kategori
      kazaKategorisi: "Is"
    };
    
    try {
      const response = await hesaplaIsKazasiTazminati(requestBody);
      console.log("API response:", response); // API yanıtını konsola yazdırın
      
      // Ana değişiklik burada:
      if (response) {
        const formattedResult = {
          result: response  // API'dan gelen string yanıt
        };
        
        setResult(formattedResult);
        setModalVisible(true);
      } else {
        throw new Error("API sonucu boş veya geçersiz.");
      }
    } catch (error) {
      console.error('API hatası:', error);
      Alert.alert('Hata', 'Hesaplama yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  
  };
  
  // API isteği fonksiyonu
  const hesaplaIsKazasiTazminati = async (requestBody) => {
    try {
      // Redux'tan token alıyoruz
      // localStorage olmadığı için Redux store'dan alıyoruz

      const response = await fetch(`${FASTAPI_URL}/api/hesapla/tazminat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json"
        },
        body: JSON.stringify({
          ...requestBody,
          user_id: username
        }),
      });

      if (!response.ok) {
        throw new Error("Hesaplama yapılırken hata oluştu!");
      }

      const data = await response.json();
      return data.report_text;
    } catch (error) {
      console.error("API hatası:", error);
      throw error;
    }
  };
  
  // Formu sıfırlama
  const resetForm = () => {
    setFullName('');
    setTcNumber('');
    setSigortaNo('');
    setBirthDate(new Date(1990, 0, 1));
    setAccidentDate(new Date());
    setReportDate(new Date());
    setSigortaTanzimDate(new Date());
    setSigortaIhbarDate(new Date());
    setMonthlyIncome('');
    setFaultRate('0');
    setRetirementAge('65');
    setGender('erkek');
    setLifeTable('PMF 1931 Yaşam Tablosu');
    setFormula('Progresif Rant Formülü');
    setTeknikFaiz('1.8');
    setDisabilityRate('');
    setGeciciIsGormezlik('');
    setBakici('');
    setEvli('');
    setAnneBaba('');
    setCocuk('');
    setCocuklar([]);
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>İş Kazası Tazminatı Hesaplama</Text>
      
      {/* Tazminat Türü Seçimi */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tazminat Türü</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setSelectedOption('olumlu')}
          >
            <View style={[styles.radioButton, selectedOption === 'olumlu' && styles.radioButtonSelected]}>
              {selectedOption === 'olumlu' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Ölümlü İş Kazası Tazminatı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.radioRow, { marginTop: 8 }]}
            onPress={() => setSelectedOption('yaralanmali')}
          >
            <View style={[styles.radioButton, selectedOption === 'yaralanmali' && styles.radioButtonSelected]}>
              {selectedOption === 'yaralanmali' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Yaralanmalı İş Kazası Tazminatı</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Genel Formül ve Yaşam Tablosu Seçimi */}
      <View style={styles.sectionTitle}>
        <Ionicons name="options-outline" size={20} color="#193353" />
        <Text style={styles.sectionTitleText}>Hesaplama Seçenekleri</Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Yaşam Tablosu</Text>
        <View style={styles.selectContainer}>
          <TouchableOpacity 
            style={[
              styles.selectOption, 
              lifeTable === 'PMF 1931 Yaşam Tablosu' && styles.selectedOption
            ]}
            onPress={() => setLifeTable('PMF 1931 Yaşam Tablosu')}
          >
            <Text style={[
              styles.selectText,
              lifeTable === 'PMF 1931 Yaşam Tablosu' && styles.selectedOptionText
            ]}>PMF 1931 Yaşam Tablosu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.selectOption, 
              lifeTable === 'TRH 2010 Yaşam Tablosu' && styles.selectedOption
            ]}
            onPress={() => setLifeTable('TRH 2010 Yaşam Tablosu')}
          >
            <Text style={[
              styles.selectText,
              lifeTable === 'TRH 2010 Yaşam Tablosu' && styles.selectedOptionText
            ]}>TRH 2010 Yaşam Tablosu</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Formül</Text>
        <View style={styles.selectContainer}>
          <TouchableOpacity 
            style={[
              styles.selectOption, 
              formula === 'Progresif Rant Formülü' && styles.selectedOption
            ]}
            onPress={() => setFormula('Progresif Rant Formülü')}
          >
            <Text style={[
              styles.selectText,
              formula === 'Progresif Rant Formülü' && styles.selectedOptionText
            ]}>Progresif Rant Formülü</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.selectOption, 
              formula === 'Devre Başı Ödemeli Belirli Süreli Rant' && styles.selectedOption
            ]}
            onPress={() => setFormula('Devre Başı Ödemeli Belirli Süreli Rant')}
          >
            <Text style={[
              styles.selectText,
              formula === 'Devre Başı Ödemeli Belirli Süreli Rant' && styles.selectedOptionText
            ]}>Devre Başı Ödemeli Belirli Süreli Rant</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {formula === 'Devre Başı Ödemeli Belirli Süreli Rant' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Teknik Faiz</Text>
          <View style={styles.selectContainer}>
            <TouchableOpacity 
              style={[
                styles.selectOption, 
                teknikFaiz === '1.8' && styles.selectedOption
              ]}
              onPress={() => setTeknikFaiz('1.8')}
            >
              <Text style={[
                styles.selectText,
                teknikFaiz === '1.8' && styles.selectedOptionText
              ]}>%1.8</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.selectOption, 
                teknikFaiz === '1.65' && styles.selectedOption
              ]}
              onPress={() => setTeknikFaiz('1.65')}
            >
              <Text style={[
                styles.selectText,
                teknikFaiz === '1.65' && styles.selectedOptionText
              ]}>%1.65</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Kişisel Bilgiler */}
      <View style={styles.sectionTitle}>
        <Ionicons name="person-outline" size={20} color="#193353" />
        <Text style={styles.sectionTitleText}>Kişisel Bilgiler</Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Kazazedenin adı soyadı"
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
        <Text style={styles.label}>Sigorta Poliçe Numarası</Text>
        <TextInput
          style={styles.input}
          value={sigortaNo}
          onChangeText={setSigortaNo}
          placeholder="Varsa sigorta poliçe numarası"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Doğum Tarihi</Text>
        <DateTimePicker
          value={birthDate}
          onChange={(_, selectedDate) => handleDateChange(selectedDate, setBirthDate)}
          maximumDate={new Date()}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kaza Tarihi</Text>
        <DateTimePicker
          value={accidentDate}
          onChange={(_, selectedDate) => handleDateChange(selectedDate, setAccidentDate)}
          maximumDate={new Date()}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Rapor Düzenleme Tarihi</Text>
        <DateTimePicker
          value={reportDate}
          onChange={(_, selectedDate) => handleDateChange(selectedDate, setReportDate)}
          maximumDate={new Date()}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Sigorta Poliçe Tanzim Tarihi</Text>
        <DateTimePicker
          value={sigortaTanzimDate}
          onChange={(_, selectedDate) => handleDateChange(selectedDate, setSigortaTanzimDate)}
          maximumDate={new Date()}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Sigortalı İhbar Tarihi</Text>
        <DateTimePicker
          value={sigortaIhbarDate}
          onChange={(_, selectedDate) => handleDateChange(selectedDate, setSigortaIhbarDate)}
          maximumDate={new Date()}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Olay Tarihindeki Gelir Durumu (TL)</Text>
        <TextInput
          style={styles.input}
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
          placeholder="Aylık brüt gelir"
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kusur Oranı (%)</Text>
        <TextInput
          style={styles.input}
          value={faultRate}
          onChangeText={setFaultRate}
          placeholder="Kusur oranı"
          keyboardType="numeric"
          maxLength={3}
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
        <Text style={styles.label}>Cinsiyet</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setGender('erkek')}
          >
            <View style={[styles.radioButton, gender === 'erkek' && styles.radioButtonSelected]}>
              {gender === 'erkek' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Erkek</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setGender('kadin')}
          >
            <View style={[styles.radioButton, gender === 'kadin' && styles.radioButtonSelected]}>
              {gender === 'kadin' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Kadın</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Yaralanmalı İş Kazası Bilgileri */}
      {selectedOption === 'yaralanmali' && (
        <>
          <View style={styles.sectionTitle}>
            <Ionicons name="medkit-outline" size={20} color="#193353" />
            <Text style={styles.sectionTitleText}>Yaralanma Bilgileri</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Maluliyet Oranı (%)</Text>
            <TextInput
              style={styles.input}
              value={disabilityRate}
              onChangeText={setDisabilityRate}
              placeholder="Maluliyet oranı"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Geçici İş Görmezlik Süresi (Gün)</Text>
            <TextInput
              style={styles.input}
              value={geciciIsGormezlik}
              onChangeText={setGeciciIsGormezlik}
              placeholder="Geçici iş görmezlik süresi"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bakıcı Gideri (Aylık TL)</Text>
            <TextInput
              style={styles.input}
              value={bakici}
              onChangeText={setBakici}
              placeholder="Aylık bakıcı gideri (varsa)"
              keyboardType="numeric"
            />
          </View>
        </>
      )}
      
      {/* Aile Bilgileri (Ölümlü İş Kazası) */}
      {selectedOption === 'olumlu' && (
        <>
          <View style={styles.sectionTitle}>
            <Ionicons name="people-outline" size={20} color="#193353" />
            <Text style={styles.sectionTitleText}>Aile Bilgileri</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Medeni Hali</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setEvli('evli')}
              >
                <View style={[styles.radioButton, evli === 'evli' && styles.radioButtonSelected]}>
                  {evli === 'evli' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Evli</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setEvli('bekar')}
              >
                <View style={[styles.radioButton, evli === 'bekar' && styles.radioButtonSelected]}>
                  {evli === 'bekar' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Bekar</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {evli === 'evli' && (
            <>
              <View style={styles.subSectionTitle}>
                <Text style={styles.subSectionTitleText}>Eş Bilgileri</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Eşin Doğum Tarihi</Text>
                <DateTimePicker
                  value={esDogumTarihi}
                  onChange={(_, selectedDate) => handleDateChange(selectedDate, setEsDogumTarihi)}
                  maximumDate={new Date()}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Eş İçin Mahsup Ödeme (TL)</Text>
                <TextInput
                  style={styles.input}
                  value={esMahsupOdeme}
                  onChangeText={setEsMahsupOdeme}
                  placeholder="Eş için mahsup ödeme (varsa)"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Eş Mahsup Ödeme Tarihi</Text>
                <DateTimePicker
                  value={esMahsupOdemeTarihi}
                  onChange={(_, selectedDate) => handleDateChange(selectedDate, setEsMahsupOdemeTarihi)}
                  maximumDate={new Date()}
                />
              </View>
            </>
          )}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Anne Baba Var mı?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setAnneBaba('evet')}
              >
                <View style={[styles.radioButton, anneBaba === 'evet' && styles.radioButtonSelected]}>
                  {anneBaba === 'evet' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Evet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setAnneBaba('hayir')}
              >
                <View style={[styles.radioButton, anneBaba === 'hayir' && styles.radioButtonSelected]}>
                  {anneBaba === 'hayir' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Hayır</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {anneBaba === 'evet' && (
            <>
              <View style={styles.subSectionTitle}>
                <Text style={styles.subSectionTitleText}>Anne Baba Bilgileri</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Anne Doğum Tarihi</Text>
                <DateTimePicker
                  value={anneDogumTarihi}
                  onChange={(_, selectedDate) => handleDateChange(selectedDate, setAnneDogumTarihi)}
                  maximumDate={new Date()}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Anne İçin Mahsup Ödeme (TL)</Text>
                  <TextInput
                    style={styles.input}
                    value={anneMahsupOdeme}
                    onChangeText={setAnneMahsupOdeme}
                    placeholder="Anne için mahsup ödeme (varsa)"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Anne Mahsup Ödeme Tarihi</Text>
                  <DateTimePicker
                    value={anneMahsupOdemeTarihi}
                    onChange={(_, selectedDate) => handleDateChange(selectedDate, setAnneMahsupOdemeTarihi)}
                    maximumDate={new Date()}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Baba Doğum Tarihi</Text>
                  <DateTimePicker
                    value={babaDogumTarihi}
                    onChange={(_, selectedDate) => handleDateChange(selectedDate, setBabaDogumTarihi)}
                    maximumDate={new Date()}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Baba İçin Mahsup Ödeme (TL)</Text>
                  <TextInput
                    style={styles.input}
                    value={babaMahsupOdeme}
                    onChangeText={setBabaMahsupOdeme}
                    placeholder="Baba için mahsup ödeme (varsa)"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Baba Mahsup Ödeme Tarihi</Text>
                  <DateTimePicker
                    value={babaMahsupOdemeTarihi}
                    onChange={(_, selectedDate) => handleDateChange(selectedDate, setBabaMahsupOdemeTarihi)}
                    maximumDate={new Date()}
                  />
                </View>
              </>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Çocuk Var mı?</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={styles.radioRow}
                  onPress={() => setCocuk('evet')}
                >
                  <View style={[styles.radioButton, cocuk === 'evet' && styles.radioButtonSelected]}>
                    {cocuk === 'evet' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Evet</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioRow}
                  onPress={() => setCocuk('hayir')}
                >
                  <View style={[styles.radioButton, cocuk === 'hayir' && styles.radioButtonSelected]}>
                    {cocuk === 'hayir' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Hayır</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {cocuk === 'evet' && (
              <>
                <View style={styles.subSectionTitle}>
                  <View style={styles.subSectionTitleRow}>
                    <Text style={styles.subSectionTitleText}>Çocuk Bilgileri</Text>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => setShowChildForm(true)}
                    >
                      <Ionicons name="add-circle" size={24} color="#4A90E2" />
                      <Text style={styles.addButtonText}>Çocuk Ekle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Çocuk eklemek için modal form */}
                <Modal
                  visible={showChildForm}
                  transparent={true}
                  animationType="slide"
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Çocuk Bilgileri</Text>
                        <TouchableOpacity onPress={() => setShowChildForm(false)}>
                          <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Cinsiyet</Text>
                        <View style={styles.radioGroup}>
                          <TouchableOpacity 
                            style={styles.radioRow}
                            onPress={() => setCurrentCocuk({...currentCocuk, cinsiyet: 'Erkek'})}
                          >
                            <View style={[
                              styles.radioButton, 
                              currentCocuk.cinsiyet === 'Erkek' && styles.radioButtonSelected
                            ]}>
                              {currentCocuk.cinsiyet === 'Erkek' && <View style={styles.radioButtonInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Erkek</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.radioRow}
                            onPress={() => setCurrentCocuk({...currentCocuk, cinsiyet: 'Kadın'})}
                          >
                            <View style={[
                              styles.radioButton, 
                              currentCocuk.cinsiyet === 'Kadın' && styles.radioButtonSelected
                            ]}>
                              {currentCocuk.cinsiyet === 'Kadın' && <View style={styles.radioButtonInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Kadın</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Doğum Tarihi</Text>
                        <DateTimePicker
                          value={new Date(currentCocuk.dogumTarihi)}
                          onChange={(_, selectedDate) => {
                            if (selectedDate) {
                              setCurrentCocuk({
                                ...currentCocuk, 
                                dogumTarihi: selectedDate.toISOString().split('T')[0]
                              });
                            }
                          }}
                          maximumDate={new Date()}
                        />
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Eğitim Durumu</Text>
                        <View style={styles.pickerWrapper}>
                          <TouchableOpacity 
                            style={[
                              styles.selectOption, 
                              currentCocuk.egitimDurumu === 'Okumuyor' && styles.selectedOption
                            ]}
                            onPress={() => setCurrentCocuk({...currentCocuk, egitimDurumu: 'Okumuyor'})}
                          >
                            <Text style={styles.selectText}>Okumuyor</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[
                              styles.selectOption, 
                              currentCocuk.egitimDurumu === 'İlkokul' && styles.selectedOption
                            ]}
                            onPress={() => setCurrentCocuk({...currentCocuk, egitimDurumu: 'İlkokul'})}
                          >
                            <Text style={styles.selectText}>İlkokul</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[
                              styles.selectOption, 
                              currentCocuk.egitimDurumu === 'Ortaokul' && styles.selectedOption
                            ]}
                            onPress={() => setCurrentCocuk({...currentCocuk, egitimDurumu: 'Ortaokul'})}
                          >
                            <Text style={styles.selectText}>Ortaokul</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[
                              styles.selectOption, 
                              currentCocuk.egitimDurumu === 'Lise' && styles.selectedOption
                            ]}
                            onPress={() => setCurrentCocuk({...currentCocuk, egitimDurumu: 'Lise'})}
                          >
                            <Text style={styles.selectText}>Lise</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[
                              styles.selectOption, 
                              currentCocuk.egitimDurumu === 'Üniversite' && styles.selectedOption
                            ]}
                            onPress={() => setCurrentCocuk({...currentCocuk, egitimDurumu: 'Üniversite'})}
                          >
                            <Text style={styles.selectText}>Üniversite</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Ömür Boyu Bakıma Muhtaç mı?</Text>
                        <View style={styles.radioGroup}>
                          <TouchableOpacity 
                            style={styles.radioRow}
                            onPress={() => setCurrentCocuk({...currentCocuk, omurBoyuBakim: 'Evet'})}
                          >
                            <View style={[
                              styles.radioButton, 
                              currentCocuk.omurBoyuBakim === 'Evet' && styles.radioButtonSelected
                            ]}>
                              {currentCocuk.omurBoyuBakim === 'Evet' && <View style={styles.radioButtonInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Evet</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.radioRow}
                            onPress={() => setCurrentCocuk({...currentCocuk, omurBoyuBakim: 'Hayır'})}
                          >
                            <View style={[
                              styles.radioButton, 
                              currentCocuk.omurBoyuBakim === 'Hayır' && styles.radioButtonSelected
                            ]}>
                              {currentCocuk.omurBoyuBakim === 'Hayır' && <View style={styles.radioButtonInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Hayır</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Mahsup Ödeme (TL)</Text>
                        <TextInput
                          style={styles.input}
                          value={currentCocuk.tutar}
                          onChangeText={(text) => setCurrentCocuk({...currentCocuk, tutar: text})}
                          placeholder="Mahsup ödeme tutarı (varsa)"
                          keyboardType="numeric"
                        />
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.submitButton}
                        onPress={handleAddCocuk}
                      >
                        <Text style={styles.submitButtonText}>Çocuğu Ekle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                
                {/* Eklenen çocukların listesi */}
                {cocuklar.length > 0 ? (
                  <View style={styles.childrenList}>
                    {cocuklar.map((cocuk, index) => (
                      <View key={index} style={styles.childItem}>
                        <View style={styles.childHeader}>
                          <Text style={styles.childTitle}>{`Çocuk ${index+1}`}</Text>
                          <TouchableOpacity 
                            onPress={() => {
                              const updatedList = [...cocuklar];
                              updatedList.splice(index, 1);
                              setCocuklar(updatedList);
                            }}
                          >
                            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                        
                        <View style={styles.childDetailRow}>
                          <Text style={styles.childDetailLabel}>Cinsiyet:</Text>
                          <Text style={styles.childDetailValue}>{cocuk.cinsiyet}</Text>
                        </View>
                        
                        <View style={styles.childDetailRow}>
                          <Text style={styles.childDetailLabel}>Doğum Tarihi:</Text>
                          <Text style={styles.childDetailValue}>{
                            format(new Date(cocuk.dogumTarihi), 'dd.MM.yyyy', { locale: tr })
                          }</Text>
                        </View>
                        
                        <View style={styles.childDetailRow}>
                          <Text style={styles.childDetailLabel}>Eğitim Durumu:</Text>
                          <Text style={styles.childDetailValue}>{cocuk.egitimDurumu}</Text>
                        </View>
                        
                        <View style={styles.childDetailRow}>
                          <Text style={styles.childDetailLabel}>Bakıma Muhtaç:</Text>
                          <Text style={styles.childDetailValue}>{cocuk.omurBoyuBakim}</Text>
                        </View>
                        
                        <View style={styles.childDetailRow}>
                          <Text style={styles.childDetailLabel}>Mahsup Ödeme:</Text>
                          <Text style={styles.childDetailValue}>{parseFloat(cocuk.tutar).toLocaleString('tr-TR')} ₺</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noChildrenInfo}>
                    <Text style={styles.noChildrenText}>Henüz çocuk eklenmedi. Çocuk eklemek için "Çocuk Ekle" butonunu kullanın.</Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
        
        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetForm}
          >
            <Ionicons name="refresh-outline" size={20} color="#666" />
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
      
      {/* Loading Animation */}
      <LoadingAnimation
        visible={loading}
        title="Hesaplama Yapılıyor"
        message="İş kazası tazminat hesaplaması yapılıyor, lütfen bekleyiniz..."
        ballColors={{
          ball1: '#D77A25',
          ball2: '#4A90E2',
          ball3: '#193353'
        }}
      />
      
      {/* Sonuç Modalı */}
      <SonucModal 
        visible={modalVisible}
        title="İş Kazası Tazminat Hesaplama Sonucu"
        onClose={() => setModalVisible(false)}
        result={result}
      />
    </ScrollView>
  );
};

// Stil tanımlamaları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#193353',
    marginBottom: 20,
    textAlign: 'center',
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  // Section Titles
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
    marginLeft: 8,
  },
  
  // SubSection Titles
  subSectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  subSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subSectionTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90E2',
  },
  
  // Radio Buttons
  radioGroup: {
    flexDirection: 'column',
    marginTop: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  
  // Select Options (Custom Dropdown)
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F0F4F8',
  },
  selectedOption: {
    borderColor: '#4A90E2',
    backgroundColor: '#EFF6FF',
  },
  selectText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  // Button Container
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
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
  
  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#193353',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Children List
  childrenList: {
    marginTop: 12,
  },
  childItem: {
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  childTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#193353',
  },
  childDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
  },
  childDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  childDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  noChildrenInfo: {
    padding: 12,
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    marginTop: 8,
  },
  noChildrenText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default IsKazasiTazminati;