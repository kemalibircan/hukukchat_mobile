import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '../../../functions/DateTimePicker';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useSelector } from 'react-redux';
import { selectUserName } from '../../../slices/userSlices';
import SonucModal from './SonucModal';
import LoadingAnimation from '../../../functions/LoadingAnimation';



const InfazHesapla = () => {
  
  const [birthDate, setBirthDate] = useState(new Date());
  const userId = useSelector(selectUserName)
  const [crimes, setCrimes] = useState([
    {
      crime_type: '',
      sentence_years: 0,
      sentence_months: 0,
      sentence_days: 0,
      mahsup: '',
      tekerrur: false,
      special_condition: ''
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleCrimeChange = (index, field, value) => {
    const updatedCrimes = [...crimes];
    updatedCrimes[index][field] = value;
    setCrimes(updatedCrimes);
  };

  const addCrime = () => {
    setCrimes([
      ...crimes,
      {
        crime_type: '',
        sentence_years: 0,
        sentence_months: 0,
        sentence_days: 0,
        mahsup: '',
        tekerrur: false,
        special_condition: ''
      }
    ]);
  };

  const removeCrime = (index) => {
    if (crimes.length > 1) {
      const updatedCrimes = [...crimes];
      updatedCrimes.splice(index, 1);
      setCrimes(updatedCrimes);
    } else {
      Alert.alert('Uyarı', 'En az bir suç kaydı olmalıdır.');
    }
  };

  const calculateInfaz = async () => {
    // Validate form
    if (!birthDate) {
      Alert.alert('Hata', 'Doğum tarihi girilmelidir.');
      return;
    }

    const hasEmptyCrimeType = crimes.some(crime => !crime.crime_type.trim());
    if (hasEmptyCrimeType) {
      Alert.alert('Hata', 'Tüm suç türleri doldurulmalıdır.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://api.hukukchat.com/api/infaz-hesapla', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId, 
          birth_date: format(birthDate, 'yyyy-MM-dd'),
          crimes: crimes
        })
      });

      const data = await response.json();
      console.log('API Response:', data);
      if (response.ok) {
        setResult(data);
        setModalVisible(true); // Sonuç geldiğinde modalı göster
      } else {
        Alert.alert('Hata', data.message || 'Hesaplama sırasında bir hata oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bağlantı hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBirthDate(new Date());
    setCrimes([
      {
        crime_type: '',
        sentence_years: 0,
        sentence_months: 0,
        sentence_days: 0,
        mahsup: '',
        tekerrur: false,
        special_condition: ''
      }
    ]);
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>İnfaz Hesaplama</Text>
      
      {/* Doğum Tarihi */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Doğum Tarihi</Text>
        <DateTimePicker
          value={birthDate}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      </View>

      {/* Suç Bilgileri */}
      {crimes.map((crime, index) => (
        <View key={index} style={styles.crimeContainer}>
          <View style={styles.crimeHeader}>
            <Text style={styles.crimeTitle}>Suç #{index + 1}</Text>
            {crimes.length > 1 && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeCrime(index)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Suç Türü</Text>
            <TextInput
              style={styles.input}
              value={crime.crime_type}
              onChangeText={(value) => handleCrimeChange(index, 'crime_type', value)}
              placeholder="Suç türünü giriniz"
            />
          </View>

          <View style={styles.sentenceRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Yıl</Text>
              <TextInput
                style={styles.input}
                value={crime.sentence_years.toString()}
                onChangeText={(value) => handleCrimeChange(index, 'sentence_years', parseInt(value) || 0)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginHorizontal: 4 }]}>
              <Text style={styles.label}>Ay</Text>
              <TextInput
                style={styles.input}
                value={crime.sentence_months.toString()}
                onChangeText={(value) => handleCrimeChange(index, 'sentence_months', parseInt(value) || 0)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Gün</Text>
              <TextInput
                style={styles.input}
                value={crime.sentence_days.toString()}
                onChangeText={(value) => handleCrimeChange(index, 'sentence_days', parseInt(value) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mahsup</Text>
            <TextInput
              style={styles.input}
              value={crime.mahsup}
              onChangeText={(value) => handleCrimeChange(index, 'mahsup', value)}
              placeholder="Tutukluluk süresi varsa belirtiniz"
            />
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => handleCrimeChange(index, 'tekerrur', !crime.tekerrur)}
            >
              {crime.tekerrur ? (
                <Ionicons name="checkbox" size={24} color="#4A90E2" />
              ) : (
                <Ionicons name="square-outline" size={24} color="#666" />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Tekerrür</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Özel Durum</Text>
            <TextInput
              style={styles.input}
              value={crime.special_condition}
              onChangeText={(value) => handleCrimeChange(index, 'special_condition', value)}
              placeholder="Varsa belirtiniz"
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addCrime}>
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Suç Ekle</Text>
      </TouchableOpacity>

      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
          <Text style={styles.resetButtonText}>Sıfırla</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.calculateButton} 
          onPress={calculateInfaz}
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

      {/* Animasyonlu Loading Modal */}

      <LoadingAnimation
        visible={loading}
        title="Hesaplama Yapılıyor"
        message="İnfaz hesaplaması yapılıyor, lütfen bekleyiniz..."
        ballColors={{
          ball1: '#D77A25',
          ball2: '#4A90E2',
          ball3: '#193353'
        }}
      />
      {/* Sonuç Modalı */}
      <SonucModal 
        visible={modalVisible}
        title={"İnfaz Hesaplama Sonucu"}
        onClose={() => setModalVisible(false)}
        result={result}
      />

      {/* Özet Sonuç (Opsiyonel - Modal olmadan kart olarak gösterilen eski versiyon) */}
      {result && !modalVisible && (
        <TouchableOpacity 
          style={styles.resultSummaryCard}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.resultSummaryHeader}>
            <Text style={styles.resultSummaryTitle}>Hesaplama Sonucu</Text>
            <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
          </View>
          
          <Text style={styles.resultSummaryText}>
            Detaylı raporu görüntülemek için dokunun
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default InfazHesapla;

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
  ballContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ball: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#193353',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
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
  crimeContainer: {
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  crimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  crimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
  },
  removeButton: {
    padding: 4,
  },
  sentenceRow: {
    flexDirection: 'row',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  resultSummaryCard: {
    backgroundColor: '#F0F9F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  resultSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  resultSummaryText: {
    fontSize: 14,
    color: '#388E3C',
  },
  // Loading animation styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#193353',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: '#E0E7FF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '100%', // Sabit genişlik
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  }
});