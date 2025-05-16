import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { orangeColor } from '../../statics/color';
import { useRoute } from '@react-navigation/native';
import { Flow } from 'react-native-animated-spinkit';
import { useDispatch } from 'react-redux';
import { toggleMailAlreadyInUse, toggleServerErrorModalVisible, toggleUserCreated, toggleUserNameAlreadyInUseVisible, toggleWarningFuncVisible } from '../../slices/modalSlices';
import WarningFunc from '../app/modals/Warnings/WarningFunc';
import ServerErrorModal from '../app/modals/Warnings/ServerErrorModal';
import UserNameAlreadyInUse from '../app/modals/Warnings/UserNameAlreadyInUse';
import MailAlreadyInUse from '../app/modals/Warnings/MailAlreadyInUse';
import UserCreated from '../app/modals/Warnings/UserCreated';

const SelectAvatar = () => {
  const navigation = useNavigation();
  const [avatars, setAvatars] = useState([]);
  const [avatarLink, setAvatarLink] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const route = useRoute();
  const [imageLoading, setImageLoading] = useState(false);  
  const { userDetails } = route.params || {};
  const [avatarId, setAvatarId] = useState(null);

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSend = () => {
    if (!avatarLink) {
      dispatch(toggleWarningFuncVisible(true));
      return;
    }
    setLoading(true);

    fetch('https://api.hukukchat.com/create_mobile_user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userDetails.username,
        email: userDetails.email,
        password: userDetails.password,
        icon_id: avatarId
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log( data);
        setLoading(false);
        if (data.msg === "Mobile kullanıcı başarıyla oluşturuldu, aktivasyon için lütfen e-postanızı kontrol edin!") {
          dispatch(toggleUserCreated(true));
        } else if (data.message === "An error occurred: Bu e-posta adresi zaten kullanılıyor") {
          dispatch(toggleMailAlreadyInUse(true));
        } else if (data.message === "An error occurred: Bu kullanıcı adı zaten alınmış") {
          dispatch(toggleUserNameAlreadyInUseVisible(true));
        } else {
          dispatch(toggleServerErrorModalVisible(true));

        }
      })
      .catch(error => {
        console.error('Error:', error);
        dispatch(toggleServerErrorModalVisible(true));
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log(avatarLink);
  }, [avatarLink]);

  useEffect(() => {
    setImageLoading(true);
    fetch('https://www.hukukchat.com/get_icons')
      .then(response => response.json())
      .then(data => {
        setAvatars(data);
        setImageLoading(false);
      })
      .catch(error => {
        setImageLoading(false);
        toggleServerErrorModalVisible(true);
        console.error('Error fetching avatars:', error)});
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.avatarContainer,
        {
          backgroundColor: selectedAvatarId === item.id ? 'orange' : 'white',
        }
      ]}
      onPress={() => {
        setSelectedAvatarId(item.id);
        setAvatarLink(item.url);
        setAvatarId(item.id);
      }}
    >
      <Image
        resizeMode="cover"
        source={{ uri: `https://www.hukukchat.com${item.url}` }}
        style={styles.avatar}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <UserNameAlreadyInUse/>
      <MailAlreadyInUse/>
      <UserCreated/>
        <WarningFunc message='Lütfen bir avatar seçin' button='Tamam' />
        <ServerErrorModal />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { navigation.navigate('Welcome'); }}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          {loading ? (
            <Flow color={'white'} size={30} style={{marginRight:10}} />
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleSend}>
              <Text style={styles.nextButtonText}>Başlayalım</Text>
              <Ionicons name="arrow-forward" size={30} color="white" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Kendinize Uygun Avatarı Seçiniz</Text>
        </View>
        <View style={{marginHorizontal:10,borderWidth:2,marginTop:10,borderRadius:20,borderColor:'white',paddingTop:10}}>
          
        <FlatList
          data={avatars}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.flatListContent}
          scrollEnabled={false}
        />
                </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orangeColor,
    justifyContent: 'flex-start',
  },
  header: {
    paddingLeft: 20,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    marginRight: 5,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  titleText: {
    fontSize: 19,
    color: 'white',
    fontWeight: '600',
  },
  flatListContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 100,
    padding:10,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    borderColor:'orange',
    margin: 10,
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 40,
  },
});

export default SelectAvatar;
