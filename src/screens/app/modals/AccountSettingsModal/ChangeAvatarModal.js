import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Flow } from 'react-native-animated-spinkit';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectCounter,
  selectIsChangeAvatarVisible,
  setCounter,
  toggleChangeAvatarVisible,
  toggleServerErrorModalVisible,
} from '../../../../slices/modalSlices';
import { orangeColor } from '../../../../statics/color';
import { setIconId } from '../../../../slices/userSlices';

const ChangeAvatarModal = ({ userId }) => {
  const [avatars, setAvatars] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const dispatch = useDispatch();
  const selectModalVisible = useSelector(selectIsChangeAvatarVisible);
  const counter = useSelector(selectCounter)
  const [uploading, setUploading] = useState(false);

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
        console.error('Error fetching avatars:', error);
      });
  }, []);

  const onClose = () => {
    dispatch(toggleChangeAvatarVisible(false));
    dispatch(setCounter(counter + 1))
  };

  const handleAvatarSelect = (id, url) => {
    setSelectedAvatarId(id);
    dispatch(setIconId(id));
    setUploading(true);
    // API çağrısı
    fetch(`https://api.hukukchat.com/update_user_icon/${userId}?icon_id=${id}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        setUploading(false);
    if (data.message === 'Icon updated successfully') {
        onClose();
        
        }
        else{
            onClose();

        }
        
      })
      .catch(error => {
        dispatch(toggleServerErrorModalVisible(false));
        onClose();
        setUploading(false);
      });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.avatarContainer,
        {
          backgroundColor: selectedAvatarId === item.id ? 'orange' : 'white',
        },
      ]}
      onPress={() => handleAvatarSelect(item.id, item.url)}
    >
      <Image
        resizeMode="cover"
        source={{ uri: `https://www.hukukchat.com${item.url}` }}
        style={styles.avatar}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      style={{ flex: 1, backgroundColor: 'white', margin: 0 }}
      statusBarTranslucent={false}
      isVisible={selectModalVisible}
      hasBackdrop={true}
      animationIn={'slideInRight'}
      animationOut={'slideOutRight'}
      animationInTiming={500}
      animationOutTiming={500}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            {
                uploading ?
                    (
                        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',paddingRight:10}}>

                    <Text style={{ color: 'white', fontSize: 20 }}>Yükleniyor</Text>
               
                <Flow color={'white'} size={30} style={{marginLeft:4}} />
                </View>

                    )
                    :
                    null
                }
                
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Kendinize Uygun Avatarı Seçiniz</Text>
          </View>
          <View
            style={{
              marginHorizontal: 10,
              borderWidth: 2,
              marginTop: 10,
              borderRadius: 20,
              borderColor: 'white',
              paddingTop: 10,
            }}
          >
            {imageLoading ? (
              <Flow color={'white'} size={30} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={avatars}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                contentContainerStyle={styles.flatListContent}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default ChangeAvatarModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orangeColor,
    justifyContent: 'center',
  },
  header: {
    paddingLeft: 20,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: 10,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    borderColor: 'orange',
    margin: 10,
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 40,
  },
});
