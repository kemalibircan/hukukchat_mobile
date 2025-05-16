import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InfazHesapla from './Infaz';
import KidemIhbarTazminati from './KidemIhbarTazminati';
import IsKazasiTazminati from './IsKazasiTazminati';
import TrafikKazasiTazminati from './TrafikKazasiTazminati';


const TABS = [
  {
    id: 'kidem_ihbar',
    title: 'Kıdem & İhbar',
    icon: 'document-outline',
    description: 'İşçilik kıdem ve ihbar tazminatı hesaplamaları',
    component: KidemIhbarTazminati,
  },
  {
    id: 'trafik_kazasi',
    title: 'Trafik Kazası',
    icon: 'car-outline',
    description: 'Trafik kazası tazminatı hesaplama',
    component: TrafikKazasiTazminati,
  },
  {
    id: 'is_kazasi',
    title: 'İş Kazası',
    icon: 'alert-circle-outline',
    description: 'İş kazası tazminatı hesaplama',
    component: IsKazasiTazminati,
  },
  {
    id: 'infaz',
    title: 'İnfaz Hesapla',
    icon: 'calculator-outline',
    description: 'Ceza infaz hesaplama formu',
    component: InfazHesapla,
  },
];

const CalculationsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('kidem_ihbar');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderSelectedComponent = () => {
    const selectedTab = TABS.find(tab => tab.id === activeTab);
    const SelectedComponent = selectedTab.component;
    return <SelectedComponent />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#193353" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesaplamalar</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => handleTabChange(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={22} 
                color={activeTab === tab.id ? "#D77A25" : "#666"} 
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Description Card */}
      <View style={styles.descriptionCard}>
        <View style={styles.descriptionIconContainer}>
          <Ionicons 
            name={TABS.find(tab => tab.id === activeTab)?.icon || 'calculator-outline'} 
            size={24} 
            color="#D77A25" 
          />
        </View>
        <Text style={styles.descriptionText}>
          {TABS.find(tab => tab.id === activeTab)?.description || ''}
        </Text>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {renderSelectedComponent()}
      </View>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#193353',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabScroll: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F7F0EA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#D77A25',
    fontWeight: '600',
  },
  descriptionCard: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  descriptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  contentContainer: {
    flex: 1,
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    padding: 16,
  },
});

export default CalculationsScreen;