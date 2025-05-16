import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Dimensions
} from 'react-native';

const LoadingAnimation = ({ 
  visible, 
  title = "Yükleniyor", 
  message = "İşleminiz yapılıyor, lütfen bekleyiniz...",
  ballColors = {
    ball1: '#D77A25',
    ball2: '#4A90E2',
    ball3: '#193353'
  },
  containerStyle = {},
  titleStyle = {},
  messageStyle = {}
}) => {
  // 3 farklı top için animasyon değerleri
  const spinValue1 = useRef(new Animated.Value(0)).current;
  const spinValue2 = useRef(new Animated.Value(0)).current;
  const spinValue3 = useRef(new Animated.Value(0)).current;
  
  const scaleValue1 = useRef(new Animated.Value(1)).current;
  const scaleValue2 = useRef(new Animated.Value(0.8)).current;
  const scaleValue3 = useRef(new Animated.Value(0.6)).current;
  
  const positionX1 = useRef(new Animated.Value(0)).current;
  const positionY1 = useRef(new Animated.Value(0)).current;
  const positionX2 = useRef(new Animated.Value(0)).current;
  const positionY2 = useRef(new Animated.Value(0)).current;
  const positionX3 = useRef(new Animated.Value(0)).current;
  const positionY3 = useRef(new Animated.Value(0)).current;
  
  const progressValue = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      // Top 1 animasyonları
      Animated.loop(
        Animated.timing(spinValue1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Top 1 yörünge hareketi
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(positionX1, {
              toValue: 30,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionX1, {
              toValue: -30,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionX1, {
              toValue: 0,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(positionY1, {
              toValue: -20,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionY1, {
              toValue: 20,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionY1, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ])
        ])
      ).start();
      
      // Top 1 büyüme/küçülme
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue1, {
            toValue: 1.3,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue1, {
            toValue: 0.7,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue1, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();

      // Top 2 animasyonları
      Animated.loop(
        Animated.timing(spinValue2, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Top 2 yörünge hareketi
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(positionX2, {
              toValue: -40,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionX2, {
              toValue: 40,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionX2, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(positionY2, {
              toValue: 30,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionY2, {
              toValue: -30,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionY2, {
              toValue: 0,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ])
        ])
      ).start();
      
      // Top 2 büyüme/küçülme
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue2, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue2, {
            toValue: 0.6,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue2, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();

      // Top 3 animasyonları
      Animated.loop(
        Animated.timing(spinValue3, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Top 3 yörünge hareketi
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(positionX3, {
              toValue: 20,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionX3, {
              toValue: -20,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionX3, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(positionY3, {
              toValue: -40,
              duration: 1800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionY3, {
              toValue: 40,
              duration: 1800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(positionY3, {
              toValue: 0,
              duration: 1800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ])
        ])
      ).start();
      
      // Top 3 büyüme/küçülme
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue3, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue3, {
            toValue: 0.5,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue3, {
            toValue: 0.6,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();

      // İlerleme çubuğu animasyonu
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressValue, {
            toValue: 0.8,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(progressValue, {
            toValue: 0.4,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      // Animasyonları durdur
      spinValue1.stopAnimation();
      spinValue2.stopAnimation();
      spinValue3.stopAnimation();
      scaleValue1.stopAnimation();
      scaleValue2.stopAnimation();
      scaleValue3.stopAnimation();
      positionX1.stopAnimation();
      positionY1.stopAnimation();
      positionX2.stopAnimation();
      positionY2.stopAnimation();
      positionX3.stopAnimation();
      positionY3.stopAnimation();
      progressValue.stopAnimation();
    }
  }, [visible]);

  // Dönüş değerlerini hesapla
  const spin1 = spinValue1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const spin2 = spinValue2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  
  const spin3 = spinValue3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.loadingOverlay}>
        <View style={[styles.loadingContainer, containerStyle]}>
          <View style={styles.ballContainer}>
            {/* Top 1 */}
            <Animated.View
              style={[
                styles.ball,
                {
                  backgroundColor: ballColors.ball1,
                  transform: [
                    { rotate: spin1 },
                    { scale: scaleValue1 },
                    { translateX: positionX1 },
                    { translateY: positionY1 }
                  ]
                }
              ]}
            />
            
            {/* Top 2 */}
            <Animated.View
              style={[
                styles.ball,
                {
                  backgroundColor: ballColors.ball2,
                  transform: [
                    { rotate: spin2 },
                    { scale: scaleValue2 },
                    { translateX: positionX2 },
                    { translateY: positionY2 }
                  ]
                }
              ]}
            />
            
            {/* Top 3 */}
            <Animated.View
              style={[
                styles.ball,
                {
                  backgroundColor: ballColors.ball3,
                  transform: [
                    { rotate: spin3 },
                    { scale: scaleValue3 },
                    { translateX: positionX3 },
                    { translateY: positionY3 }
                  ]
                }
              ]}
            />
          </View>
          
          <Text style={[styles.loadingTitle, titleStyle]}>{title}</Text>
          
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: ballColors.ball2,
                  transform: [{ scaleX: progressValue }]
                }
              ]} 
            />
          </View>
          
          <Text style={[styles.loadingText, messageStyle]}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: '#E0E7FF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '100%', // Sabit genişlik, scaleX ile transform edilecek
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LoadingAnimation;