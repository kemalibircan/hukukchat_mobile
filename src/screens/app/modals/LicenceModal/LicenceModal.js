import React, { useState,useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { orangeColor } from '../../../../statics/color';
import { Plane } from 'react-native-animated-spinkit';
import { selectIsKVKKModalVisible, selectIsLicenceModalVisible, toggleKVKKModalVisible, toggleLicenceModalVisible } from '../../../../slices/modalSlices';
import { BackHandler } from 'react-native';
const CustomWebView = ({ uri, onClose }) => {
  const [loading, setLoading] = useState(true);




  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri }}
        onLoadEnd={() => setLoading(false)}
        style={{ flex: 1 }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <Plane size={65} color={orangeColor} />
        </View>
      )}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <View style={styles.iconContainer}>
          <Ionicons name="close-outline" color={orangeColor} size={35} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const LicenceModal = () => {
  const isModalVisible = useSelector(selectIsLicenceModalVisible);
  const dispatch = useDispatch();

  return (
    <Modal
      style={{ flex: 1, margin: 0,backgroundColor:orangeColor }}
      isVisible={isModalVisible}
      hasBackdrop={true}
      animationIn={'slideInRight' }
      animationOut={'slideOutRight'}
      animationInTiming={500}
      animationOutTiming={500}
      backdropOpacity={1}
      backdropColor="white"
      onRequestClose={() => {
        dispatch(toggleLicenceModalVisible(false))
     }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <CustomWebView

          uri="https://www.hukukchat.com/cerez-politikasi"
          onClose={() => dispatch(toggleLicenceModalVisible(false))}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default LicenceModal;

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  iconContainer: {
    borderRadius: 5,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    justifyContent: 'center',
    alignItems: 'center',
  },
});
