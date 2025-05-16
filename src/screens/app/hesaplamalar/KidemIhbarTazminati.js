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
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useSelector } from 'react-redux';
import { selectUserName } from '../../../slices/userSlices';

// Import custom components
import DateTimePicker from '../../../functions/DateTimePicker';
import LoadingAnimation from '../../../functions/LoadingAnimation';
import SonucModal from './SonucModal';

const KidemIhbarTazminati = () => {
  const userId = useSelector(selectUserName);
  const [fullName, setFullName] = useState('');
  const [tcNumber, setTcNumber] = useState('');
  const [reportDate, setReportDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [netWage, setNetWage] = useState('');
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState(5);
  const [dailyWorkHours, setDailyWorkHours] = useState(8);
  const [usedLeaveDays, setUsedLeaveDays] = useState(0);
  const [leaveDays, setLeaveDays] = useState(0);
  const [weeklyOvertimeHours, setWeeklyOvertimeHours] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [knowsGross, setKnowsGross] = useState(false);
  const [dailyWageFixed, setDailyWageFixed] = useState(true);
  const [gotRaise, setGotRaise] = useState(false);
  const [intermittentWork, setIntermittentWork] = useState(false);

  const [calculationTypes, setCalculationTypes] = useState({
    kidemTazminati: true,
    ihbarTazminati: true,
    fazlaMesai: false,
    ubgt: false,
    yillikIzin: false,
    haftaTatili: false,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleReportDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setReportDate(selectedDate);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const toggleCalculationType = (type) => {
    setCalculationTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const calculateCompensation = async () => {
    // Form validation
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Adı Soyadı alanı zorunludur.');
      return;
    }
  
    if (!tcNumber.trim() || tcNumber.length !== 11) {
      Alert.alert('Hata', 'TC Kimlik Numarası 11 haneli olmalıdır.');
      return;
    }
  
    if (!netWage || parseFloat(netWage) <= 0) {
      Alert.alert('Hata', 'Geçerli bir ücret girmelisiniz.');
      return;
    }
  
    if (startDate >= endDate) {
      Alert.alert('Hata', 'İşe başlangıç tarihi, iş bitiş tarihinden önce olmalıdır.');
      return;
    }
  
    setLoading(true);
  
    // Map component calculation types to API expected format
    // This was the critical issue - we need to match the web format
    const selectedTypes = [];
    
    if (calculationTypes.kidemTazminati) selectedTypes.push("Kıdem Tazminatı");
    if (calculationTypes.ihbarTazminati) selectedTypes.push("İhbar Tazminatı");
    if (calculationTypes.fazlaMesai) selectedTypes.push("Fazla Mesai Alacağı");
    if (calculationTypes.ubgt) selectedTypes.push("UBGT Alacağı");
    if (calculationTypes.yillikIzin) selectedTypes.push("Yıllık Ücretli İzin Alacağı");
    if (calculationTypes.haftaTatili) selectedTypes.push("Hafta Tatili Alacağı");
  
    // Make sure we have at least one type selected
    if (selectedTypes.length === 0) {
      Alert.alert('Hata', 'En az bir hesaplama türü seçmelisiniz.');
      setLoading(false);
      return;
    }
  
    // Default values for work periods if intermittent work is selected
    let workPeriods = [];
    if (intermittentWork) {
      workPeriods = [
        {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          finalSalary: parseFloat(netWage),
          rightsPaid: false
        }
      ];
    }
  
    try {
      // Constructing the API request body to match the web implementation
      const requestBody = {
        user_id: userId || "anonymous",
        fullName: fullName,
        tcNumber: tcNumber,
        reportDate: format(reportDate, 'yyyy-MM-dd'),
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        
        // Set either monthlyNetWage or grossSalary based on knowsGross
        monthlyNetWage: knowsGross ? 0 : parseFloat(netWage) || 0,
        grossSalary: knowsGross ? parseFloat(netWage) || 0 : 0,
        
        // Match the selectedType and selectedTypes format from web
        selectedType: "iscilik",
        selectedTypes: selectedTypes,
        
        // Set zeros for these fields as in web implementation
        kidem: 0,
        ihbar: 0,
        yillikUcret: 0,
        fazlaMesai: 0,
        haftaTatili: 0,
        ubgt: 0,
        
        // Required fields
        workDaysPerWeek: parseInt(workDaysPerWeek) || 5,
        dailyWorkHours: parseFloat(dailyWorkHours) || 8,
        usedLeaveDays: parseInt(usedLeaveDays) || 0,
        leaveDays: parseInt(leaveDays) || 0,
        weeklyOvertimeHours: parseFloat(weeklyOvertimeHours) || 0,
        breakTime: parseFloat(breakTime) || 0,
        
        // Add the critical wageType field that was missing
        wageType: "",
        
        // Fixed/variable wage flags
        dailyWageFixed: dailyWageFixed,
        gotRaise: gotRaise,
        
        // Limitation flag (defaulting to "Hayır")
        limitationApplied: "Hayır",
        
        // Intermittent work information
        hasIntermittentWork: intermittentWork,
        workPeriods: workPeriods,
        
        // Empty social benefits array like in the web version
        socialBenefits: []
      };
  
  
      // API call
      const response = await fetch('https://api.hukukchat.com/compensation/submit/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      const data = await response.json();
      
      if (response.ok) {
        setResult({ result: data.report_text }); // Wrap the text in an object with a 'result' property
        setModalVisible(true);
      } else {
        const errorMessage = data.message || 'Hesaplama sırasında bir hata oluştu.';
        console.error('API Error:', errorMessage, data);
        Alert.alert('Hata', errorMessage);
      }
    } catch (error) {
      console.error('Connection Error:', error);
      Alert.alert('Hata', 'Bağlantı hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setTcNumber('');
    setReportDate(new Date());
    setStartDate(new Date());
    setEndDate(new Date());
    setNetWage('');
    setKnowsGross(false);
    setDailyWageFixed(true);
    setGotRaise(false);
    setIntermittentWork(false);
    
    // Reset calculation types
    setCalculationTypes({
      kidemTazminati: true,
      ihbarTazminati: true,
      fazlaMesai: false,
      ubgt: false,
      yillikIzin: false,
      haftaTatili: false,
    });
    
    // Reset additional fields
    setWorkDaysPerWeek(5);
    setDailyWorkHours(8);
    setUsedLeaveDays(0);
    setLeaveDays(0);
    setWeeklyOvertimeHours(0);
    setBreakTime(0);
    
    setResult(null);
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Kıdem & İhbar Tazminatı Hesaplama</Text>
      
      {/* Hesap Türü */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Hesap Türü</Text>
        <View style={styles.checkboxGrid}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => toggleCalculationType('kidemTazminati')}
          >
            {calculationTypes.kidemTazminati ? (
              <Ionicons name="checkbox" size={22} color="#4A90E2" />
            ) : (
              <Ionicons name="square-outline" size={22} color="#666" />
            )}
            <Text style={styles.checkboxLabel}>Kıdem Tazminatı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => toggleCalculationType('ihbarTazminati')}
          >
            {calculationTypes.ihbarTazminati ? (
              <Ionicons name="checkbox" size={22} color="#4A90E2" />
            ) : (
              <Ionicons name="square-outline" size={22} color="#666" />
            )}
            <Text style={styles.checkboxLabel}>İhbar Tazminatı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => toggleCalculationType('fazlaMesai')}
          >
            {calculationTypes.fazlaMesai ? (
              <Ionicons name="checkbox" size={22} color="#4A90E2" />
            ) : (
              <Ionicons name="square-outline" size={22} color="#666" />
            )}
            <Text style={styles.checkboxLabel}>Fazla Mesai Alacağı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => toggleCalculationType('ubgt')}
          >
            {calculationTypes.ubgt ? (
              <Ionicons name="checkbox" size={22} color="#4A90E2" />
            ) : (
              <Ionicons name="square-outline" size={22} color="#666" />
            )}
            <Text style={styles.checkboxLabel}>UBGT Alacağı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => toggleCalculationType('yillikIzin')}
          >
            {calculationTypes.yillikIzin ? (
              <Ionicons name="checkbox" size={22} color="#4A90E2" />
            ) : (
              <Ionicons name="square-outline" size={22} color="#666" />
            )}
            <Text style={styles.checkboxLabel}>Yıllık Ücretli İzin Alacağı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => toggleCalculationType('haftaTatili')}
          >
            {calculationTypes.haftaTatili ? (
              <Ionicons name="checkbox" size={22} color="#4A90E2" />
            ) : (
              <Ionicons name="square-outline" size={22} color="#666" />
            )}
            <Text style={styles.checkboxLabel}>Hafta Tatili Alacağı</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Brüt ücret bilgisi */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Brüt ücretinizi biliyor musunuz?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setKnowsGross(true)}
          >
            <View style={[styles.radioButton, knowsGross && styles.radioButtonSelected]}>
              {knowsGross && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Evet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setKnowsGross(false)}
          >
            <View style={[styles.radioButton, !knowsGross && styles.radioButtonSelected]}>
              {!knowsGross && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Hayır</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Net Ücret */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{knowsGross ? 'Brüt Ücret' : 'Net Ücret'}</Text>
        <TextInput
          style={styles.input}
          value={netWage}
          onChangeText={setNetWage}
          keyboardType="numeric"
          placeholder={`Aylık ${knowsGross ? 'brüt' : 'net'} ücret`}
        />
      </View>
      
      {/* Günlük ücret */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Günlük ücretiniz sabit mi?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setDailyWageFixed(true)}
          >
            <View style={[styles.radioButton, dailyWageFixed && styles.radioButtonSelected]}>
              {dailyWageFixed && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Evet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setDailyWageFixed(false)}
          >
            <View style={[styles.radioButton, !dailyWageFixed && styles.radioButtonSelected]}>
              {!dailyWageFixed && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Hayır</Text>
          </TouchableOpacity>
        </View>
        
        {dailyWageFixed && (
          <View style={styles.nestedForm}>
            <Text style={styles.label}>Çalıştığınız son bir sene içerisinde zam aldınız mı?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setGotRaise(true)}
              >
                <View style={[styles.radioButton, gotRaise && styles.radioButtonSelected]}>
                  {gotRaise && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Evet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setGotRaise(false)}
              >
                <View style={[styles.radioButton, !gotRaise && styles.radioButtonSelected]}>
                  {!gotRaise && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Hayır</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {/* Aralıklı çalışma */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>İş yerinde aralıklı çalıştınız mı?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setIntermittentWork(true)}
          >
            <View style={[styles.radioButton, intermittentWork && styles.radioButtonSelected]}>
              {intermittentWork && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Evet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setIntermittentWork(false)}
          >
            <View style={[styles.radioButton, !intermittentWork && styles.radioButtonSelected]}>
              {!intermittentWork && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioLabel}>Hayır</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Kişisel Bilgiler */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Adı Soyadı</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Adınız ve soyadınız"
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
      
      {/* Tarihler - Using custom DateTimePicker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Rapor Düzenlenme Tarihi</Text>
        <DateTimePicker
          value={reportDate}
          onChange={handleReportDateChange}
          mode="date"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>İşe Başlangıç Tarihi</Text>
        <DateTimePicker
          value={startDate}
          onChange={handleStartDateChange}
          mode="date"
          maximumDate={endDate}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>İş Bitiş Tarihi</Text>
        <DateTimePicker
          value={endDate}
          onChange={handleEndDateChange}
          mode="date"
          minimumDate={startDate}
        />
      </View>
      <View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Çalışma Detayları</Text>
  <Text style={styles.sectionSubtitle}>Hesaplamanın doğruluğu için aşağıdaki alanları doldurunuz</Text>
</View>

<View style={styles.formGroup}>
  <Text style={styles.label}>Haftalık Çalışma Günü</Text>
  <View style={styles.inputWithUnit}>
    <TextInput
      style={[styles.input, styles.inputWithUnitField]}
      value={workDaysPerWeek.toString()}
      onChangeText={(text) => setWorkDaysPerWeek(parseInt(text) || 0)}
      keyboardType="numeric"
      placeholder="5"
    />
    <Text style={styles.unitText}>gün</Text>
  </View>
</View>

<View style={styles.formGroup}>
  <Text style={styles.label}>Günlük Çalışma Saati</Text>
  <View style={styles.inputWithUnit}>
    <TextInput
      style={[styles.input, styles.inputWithUnitField]}
      value={dailyWorkHours.toString()}
      onChangeText={(text) => setDailyWorkHours(parseFloat(text) || 0)}
      keyboardType="numeric"
      placeholder="8"
    />
    <Text style={styles.unitText}>saat</Text>
  </View>
</View>

<View style={styles.formGroup}>
  <Text style={styles.label}>Mola Süresi</Text>
  <View style={styles.inputWithUnit}>
    <TextInput
      style={[styles.input, styles.inputWithUnitField]}
      value={breakTime.toString()}
      onChangeText={(text) => setBreakTime(parseInt(text) || 0)}
      keyboardType="numeric"
      placeholder="0"
    />
    <Text style={styles.unitText}>dakika</Text>
  </View>
</View>

{calculationTypes.fazlaMesai && (
  <View style={styles.formGroup}>
    <Text style={styles.label}>Haftalık Fazla Mesai Saati</Text>
    <View style={styles.inputWithUnit}>
      <TextInput
        style={[styles.input, styles.inputWithUnitField]}
        value={weeklyOvertimeHours.toString()}
        onChangeText={(text) => setWeeklyOvertimeHours(parseFloat(text) || 0)}
        keyboardType="numeric"
        placeholder="0"
      />
      <Text style={styles.unitText}>saat</Text>
    </View>
  </View>
)}

{calculationTypes.yillikIzin && (
  <>
    <View style={styles.formGroup}>
      <Text style={styles.label}>Hak Edilen Yıllık İzin</Text>
      <View style={styles.inputWithUnit}>
        <TextInput
          style={[styles.input, styles.inputWithUnitField]}
          value={leaveDays.toString()}
          onChangeText={(text) => setLeaveDays(parseInt(text) || 0)}
          keyboardType="numeric"
          placeholder="0"
        />
        <Text style={styles.unitText}>gün</Text>
      </View>
    </View>
    
    <View style={styles.formGroup}>
      <Text style={styles.label}>Kullanılan Yıllık İzin</Text>
      <View style={styles.inputWithUnit}>
        <TextInput
          style={[styles.input, styles.inputWithUnitField]}
          value={usedLeaveDays.toString()}
          onChangeText={(text) => setUsedLeaveDays(parseInt(text) || 0)}
          keyboardType="numeric"
          placeholder="0"
        />
        <Text style={styles.unitText}>gün</Text>
      </View>
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
          onPress={calculateCompensation}
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
      <SonucModal 
        visible={modalVisible}
        title={"Tazminat Hesaplama Sonucu"}
        onClose={() => setModalVisible(false)}
        result={result}
      />
      
      {/* Özet Sonuç (Opsiyonel - Modal olmadan kart olarak gösterilen versiyon) */}
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
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginVertical: 6,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
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
  sectionHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#193353',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithUnitField: {
    flex: 1,
    marginRight: 8,
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    width: 40,
  },
  infoIcon: {
    marginLeft: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 4,
  },
  cardHeader: {
    backgroundColor: '#EBF2F9',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#193353',
  },
  cardContent: {
    padding: 12,
    backgroundColor: '#F9FAFC',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: '#EBF2F9',
    borderTopWidth: 0,
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  nestedForm: {
    marginTop: 16,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#EFEFEF',
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
});

export default KidemIhbarTazminati;