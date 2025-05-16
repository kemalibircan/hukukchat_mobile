import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  FlatList
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { format, addMonths, subMonths, addYears, subYears, getYear, getMonth, getDaysInMonth, getDay, setDate } from 'date-fns';
import { tr } from 'date-fns/locale';

const DAYS_OF_WEEK = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const DateTimePicker = ({ 
  value = new Date(), 
  onChange, 
  maximumDate, 
  minimumDate,
  mode = 'date' // 'date', 'time', 'datetime'
}) => {
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);
  const [viewDate, setViewDate] = useState(value);
  const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years', 'time'
  const [selectedHour, setSelectedHour] = useState(value.getHours());
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());
  const [displayValue, setDisplayValue] = useState(value);

  // Update selected date when value prop changes
  useEffect(() => {
    setSelectedDate(value);
    setDisplayValue(value);
    setViewDate(value);
    setSelectedHour(value.getHours());
    setSelectedMinute(value.getMinutes());
  }, [value]);

  const currentYear = getYear(viewDate);
  const currentMonth = getMonth(viewDate);
  
  // Get days of current month
  const getDaysArray = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayWeekday = getDay(firstDayOfMonth) || 7; // 0 = Sunday, we want 1 = Monday
    
    // Previous month days to fill the first week
    for (let i = 1; i < firstDayWeekday; i++) {
      const prevMonthDate = new Date(currentYear, currentMonth, 1 - i);
      days.unshift({
        day: prevMonthDate.getDate(),
        month: prevMonthDate.getMonth(),
        year: prevMonthDate.getFullYear(),
        currentMonth: false,
        date: new Date(prevMonthDate)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        currentMonth: true,
        date: date
      });
    }
    
    // Next month days to complete the last week
    const remainingCells = 7 - (days.length % 7 || 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDate = new Date(currentYear, currentMonth + 1, i);
        days.push({
          day: i,
          month: nextMonthDate.getMonth(),
          year: nextMonthDate.getFullYear(),
          currentMonth: false,
          date: new Date(nextMonthDate)
        });
      }
    }
    
    return days;
  };

  const getHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      minutes.push(i);
    }
    return minutes;
  };

  const handlePreviousMonth = () => {
    setViewDate(subMonths(viewDate, 1));
  };

  const handleNextMonth = () => {
    setViewDate(addMonths(viewDate, 1));
  };

  const handlePreviousYear = () => {
    setViewDate(subYears(viewDate, 1));
  };

  const handleNextYear = () => {
    setViewDate(addYears(viewDate, 1));
  };

  const handleMonthPress = () => {
    setViewMode('months');
  };

  const handleYearPress = () => {
    setViewMode('years');
  };

  const handleSelectMonth = (month) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(month);
    setViewDate(newDate);
    setViewMode('days');
  };

  const handleSelectYear = (year) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setViewMode('months');
  };

  const handleSelectDay = (item) => {
    const newDate = new Date(item.date);
    
    // Check if date is within bounds
    if (minimumDate && newDate < minimumDate) {
      return;
    }
    if (maximumDate && newDate > maximumDate) {
      return;
    }
    
    newDate.setHours(selectedHour, selectedMinute);
    setSelectedDate(newDate);
    
    if (mode === 'datetime') {
      setViewMode('time');
    } else {
      handleConfirm(newDate);
    }
  };

  const handleSelectHour = (hour) => {
    setSelectedHour(hour);
    const newDate = new Date(selectedDate);
    newDate.setHours(hour, selectedMinute);
    setSelectedDate(newDate);
  };

  const handleSelectMinute = (minute) => {
    setSelectedMinute(minute);
    const newDate = new Date(selectedDate);
    newDate.setHours(selectedHour, minute);
    setSelectedDate(newDate);
  };

  const handleConfirm = (dateToConfirm = selectedDate) => {
    if (onChange) {
      // Create event object similar to RN DateTimePicker
      const event = { type: 'set', nativeEvent: { timestamp: dateToConfirm.getTime() } };
      setDisplayValue(dateToConfirm);
      onChange(event, dateToConfirm);
    }
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const openPicker = () => {
    setViewDate(value);
    setSelectedDate(value);
    setSelectedHour(value.getHours());
    setSelectedMinute(value.getMinutes());
    setViewMode(mode === 'time' ? 'time' : 'days');
    setVisible(true);
  };

  const isDateInRange = (date) => {
    if (!date) return false;
    
    if (minimumDate && date < minimumDate) {
      return false;
    }
    if (maximumDate && date > maximumDate) {
      return false;
    }
    return true;
  };

  const renderDaysHeader = () => (
    <View style={styles.daysHeader}>
      {DAYS_OF_WEEK.map((day, index) => (
        <Text key={index} style={styles.dayHeaderText}>
          {day}
        </Text>
      ))}
    </View>
  );

  const renderDayItem = ({ item }) => {
    const isSelected = 
      selectedDate.getDate() === item.day && 
      selectedDate.getMonth() === item.month && 
      selectedDate.getFullYear() === item.year;
    
    const isInRange = isDateInRange(item.date);
    
    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          item.currentMonth ? styles.currentMonthDay : styles.otherMonthDay,
          isSelected && styles.selectedDay,
          !isInRange && styles.disabledDay
        ]}
        onPress={() => isInRange && handleSelectDay(item)}
        disabled={!isInRange}
      >
        <Text 
          style={[
            styles.dayText, 
            item.currentMonth ? styles.currentMonthDayText : styles.otherMonthDayText,
            isSelected && styles.selectedDayText,
            !isInRange && styles.disabledDayText
          ]}
        >
          {item.day}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMonthItem = ({ item, index }) => {
    const isSelected = selectedDate.getMonth() === index && 
                        selectedDate.getFullYear() === currentYear;
    
    return (
      <TouchableOpacity
        style={[styles.monthCell, isSelected && styles.selectedMonth]}
        onPress={() => handleSelectMonth(index)}
      >
        <Text style={[styles.monthText, isSelected && styles.selectedMonthText]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderYearItem = ({ item }) => {
    const isSelected = selectedDate.getFullYear() === item;
    
    return (
      <TouchableOpacity
        style={[styles.yearCell, isSelected && styles.selectedYear]}
        onPress={() => handleSelectYear(item)}
      >
        <Text style={[styles.yearText, isSelected && styles.selectedYearText]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTimeItem = (item, isHour) => {
    const isSelected = isHour ? selectedHour === item : selectedMinute === item;
    
    return (
      <TouchableOpacity
        key={item}
        style={[styles.timeCell, isSelected && styles.selectedTime]}
        onPress={() => isHour ? handleSelectHour(item) : handleSelectMinute(item)}
      >
        <Text style={[styles.timeText, isSelected && styles.selectedTimeText]}>
          {item.toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    );
  };

  const getYearsArray = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  const renderCalendar = () => {
    if (viewMode === 'days') {
      return (
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePreviousMonth}>
              <Ionicons name="chevron-back" size={24} color="#193353" />
            </TouchableOpacity>
            
            <View style={styles.monthYearContainer}>
              <TouchableOpacity onPress={handleMonthPress}>
                <Text style={styles.monthYearText}>
                  {MONTHS[currentMonth]}
                </Text>
              </TouchableOpacity>
              <Text style={styles.monthYearSeparator}> </Text>
              <TouchableOpacity onPress={handleYearPress}>
                <Text style={styles.monthYearText}>
                  {currentYear}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={24} color="#193353" />
            </TouchableOpacity>
          </View>
          
          {renderDaysHeader()}
          
          <FlatList
            data={getDaysArray()}
            renderItem={renderDayItem}
            keyExtractor={(item, index) => `${item.year}-${item.month}-${item.day}-${index}`}
            numColumns={7}
            scrollEnabled={false}
          />
        </View>
      );
    } else if (viewMode === 'months') {
      return (
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePreviousYear}>
              <Ionicons name="chevron-back" size={24} color="#193353" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleYearPress}>
              <Text style={styles.monthYearText}>{currentYear}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNextYear}>
              <Ionicons name="chevron-forward" size={24} color="#193353" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={MONTHS}
            renderItem={renderMonthItem}
            keyExtractor={(item, index) => `month-${index}`}
            numColumns={3}
            scrollEnabled={false}
          />
        </View>
      );
    } else if (viewMode === 'years') {
      return (
        <View style={styles.calendarContainer}>
          <FlatList
            data={getYearsArray()}
            renderItem={renderYearItem}
            keyExtractor={(item) => `year-${item}`}
            numColumns={3}
            style={styles.yearsList}
          />
        </View>
      );
    } else if (viewMode === 'time') {
      return (
        <View style={styles.timeContainer}>
          <Text style={styles.timeHeaderText}>Saat Seçin</Text>
          
          <View style={styles.timePickerContainer}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnHeader}>Saat</Text>
              <FlatList
                data={getHours()}
                renderItem={({ item }) => renderTimeItem(item, true)}
                keyExtractor={(item) => `hour-${item}`}
                style={styles.timeList}
                showsVerticalScrollIndicator={true}
                initialScrollIndex={selectedHour}
                getItemLayout={(data, index) => (
                  {length: 50, offset: 50 * index, index}
                )}
              />
            </View>
            
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnHeader}>Dakika</Text>
              <FlatList
                data={getMinutes()}
                renderItem={({ item }) => renderTimeItem(item, false)}
                keyExtractor={(item) => `minute-${item}`}
                style={styles.timeList}
                showsVerticalScrollIndicator={true}
                initialScrollIndex={selectedMinute}
                getItemLayout={(data, index) => (
                  {length: 50, offset: 50 * index, index}
                )}
              />
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.input} onPress={openPicker}>
        <Text style={styles.inputText}>
          {format(displayValue, mode === 'time' ? 'HH:mm' : 'dd MMMM yyyy', { locale: tr })}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#193353" />
      </TouchableOpacity>
      
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {mode === 'time' ? 'Saat Seçin' : 'Tarih Seçin'}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close-outline" size={24} color="#193353" />
              </TouchableOpacity>
            </View>
            
            {renderCalendar()}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm()}>
                <Text style={styles.confirmButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F0F4F8',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 15,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#193353',
  },
  calendarContainer: {
    padding: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
  },
  monthYearSeparator: {
    fontSize: 16,
    color: '#193353',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    width: '14.28%',
    textAlign: 'center',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
  },
  currentMonthDay: {
    backgroundColor: 'transparent',
  },
  currentMonthDayText: {
    color: '#333',
  },
  otherMonthDay: {
    backgroundColor: 'transparent',
  },
  otherMonthDayText: {
    color: '#BBB',
  },
  selectedDay: {
    backgroundColor: '#D77A25',
    borderRadius: 20,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: '#999',
  },
  monthCell: {
    width: '33.33%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 8,
  },
  monthText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMonth: {
    backgroundColor: '#D77A25',
    borderRadius: 12,
  },
  selectedMonthText: {
    color: 'white',
    fontWeight: '600',
  },
  yearCell: {
    width: '33.33%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 8,
  },
  yearText: {
    fontSize: 14,
    color: '#333',
  },
  selectedYear: {
    backgroundColor: '#D77A25',
    borderRadius: 12,
  },
  selectedYearText: {
    color: 'white',
    fontWeight: '600',
  },
  yearsList: {
    maxHeight: 300,
  },
  timeContainer: {
    padding: 16,
  },
  timeHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#193353',
    textAlign: 'center',
    marginBottom: 16,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeColumn: {
    width: '45%',
  },
  timeColumnHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  timeList: {
    height: 200,
  },
  timeCell: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTime: {
    backgroundColor: '#D77A25',
  },
  selectedTimeText: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  cancelButton: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#D77A25',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default DateTimePicker;