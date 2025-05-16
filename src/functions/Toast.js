import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  Easing,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Toast = ({ visible, message, type, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  // Define colors based on toast type
  const getToastColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#10B981', icon: 'checkmark-circle' };
      case 'error':
        return { bg: '#EF4444', icon: 'alert-circle' };
      case 'warning':
        return { bg: '#F59E0B', icon: 'warning' };
      case 'info':
      default:
        return { bg: '#4A90E2', icon: 'information-circle' };
    }
  };

  const { bg, icon } = getToastColors();

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.toastContainer, 
        { 
          backgroundColor: bg,
          opacity: fadeAnim,
          transform: [{ translateY }]
        }
      ]}
    >
      <Ionicons name={icon} size={22} color="white" />
      <Text style={styles.toastMessage}>{message}</Text>
      <TouchableOpacity onPress={handleDismiss}>
        <Ionicons name="close" size={22} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  toastMessage: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginHorizontal: 10,
  }
});

export default Toast;