import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  BackHandler,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { blueColor, orangeColor } from '../../../statics/color';

const { width, height } = Dimensions.get('window');

const ChatOnboarding = ({ onComplete, elementRefs }) => {
  const [step, setStep] = useState(1);
  const [spotlightPosition, setSpotlightPosition] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Function to measure the position of a referenced element
  const measureElement = (ref) => {
    if (!ref || !ref.current) return null;
    
    return new Promise(resolve => {
      if (ref.current.measure) {
        ref.current.measure((fx, fy, width, height, px, py) => {
          resolve({
            x: px,
            y: py,
            width,
            height
          });
        });
      } else {
        resolve(null);
      }
    });
  };

  // Update spotlight position when step changes
  useEffect(() => {
    const updateSpotlight = async () => {
      let elementRef = null;
      
      switch (step) {
        case 1: elementRef = elementRefs.historyButton; break;
        case 2: elementRef = elementRefs.newChatButton; break;
        case 3: elementRef = elementRefs.webSearchToggle; break;
        case 4: elementRef = elementRefs.inputField; break;
        case 5: elementRef = elementRefs.sendButton; break;
      }
      
      if (elementRef) {
        const measurements = await measureElement(elementRef);
        setSpotlightPosition(measurements);
      }
    };
    
    updateSpotlight();
  }, [step, elementRefs]);

  // Animate transitions
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 1) {
        setStep(step - 1);
        return true;
      } else {
        onComplete();
        return true;
      }
    });

    return () => backHandler.remove();
  }, [step]);

  const nextStep = () => {
    if (step < 5) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setStep(step + 1);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.95);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    } else {
      onComplete();
    }
  };

  const renderSpotlight = () => {
    if (!spotlightPosition) return null;
    
    // Add padding around the element
    const padding = 12;
    
    return (
      <View style={{
        position: 'absolute',
        left: spotlightPosition.x - padding,
        top: spotlightPosition.y - padding,
        width: spotlightPosition.width + (padding * 2),
        height: spotlightPosition.height + (padding * 2),
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        zIndex: 5,
      }} />
    );
  };

  // Calculate tooltip position based on spotlight
  const getTooltipPosition = () => {
    if (!spotlightPosition) return { top: 100, left: width / 2 - 140 };
    
    const tooltipWidth = 280;
    const tooltipHeight = 160;
    const margin = 20;
    
    // Default position (below the element)
    let position = {
      top: spotlightPosition.y + spotlightPosition.height + margin,
      left: spotlightPosition.x + (spotlightPosition.width / 2) - (tooltipWidth / 2)
    };
    
    // Adjust horizontal position if tooltip would go offscreen
    if (position.left < margin) position.left = margin;
    if (position.left + tooltipWidth > width - margin) {
      position.left = width - tooltipWidth - margin;
    }
    
    // If tooltip would go below screen, place it above the element
    if (position.top + tooltipHeight > height - 100) {
      position = {
        top: spotlightPosition.y - tooltipHeight - margin,
        left: position.left
      };
    }
    
    return position;
  };

  const getStepInfo = () => {
    switch (step) {
      case 1:
        return {
          title: 'Sohbet Geçmişi',
          description: 'Bu buton ile önceki tüm sohbetlerinize kolayca erişebilirsiniz. Geçmiş konuşmalarınızı görmek ve eski sorularınıza dönmek için kullanın.',
          icon: 'albums-outline'
        };
      case 2:
        return {
          title: 'Yeni Sohbet',
          description: 'Yeni bir hukuki konuşma başlatmak istediğinizde bu butonu kullanın. Önceki konuşmanız kaydedilir ve yeni bir sohbet başlatılır.',
          icon: 'create-outline'
        };
      case 3:
        return {
          title: 'Web Araması',
          description: 'Bu özelliği aktifleştirdiğinizde, HukukChat güncel bilgilere ulaşmak için web araması yapabilir. Yasal konularda en güncel bilgiler için kullanın.',
          icon: 'globe-outline'
        };
      case 4:
        return {
          title: 'Soru Alanı',
          description: 'Hukuki sorularınızı veya danışmak istediğiniz konuları buraya yazabilirsiniz. Ne kadar detaylı sorarsanız, o kadar iyi yanıt alırsınız.',
          icon: 'chatbubble-outline'
        };
      case 5:
        return {
          title: 'Gönder Butonu',
          description: 'Sorunuzu yazdıktan sonra bu buton ile gönderebilirsiniz. HukukChat sorunuzu analiz edip en doğru hukuki bilgiyi sunmaya çalışacaktır.',
          icon: 'paper-plane-outline'
        };
      default:
        return {};
    }
  };

  const stepInfo = getStepInfo();
  const tooltipPosition = getTooltipPosition();

  return (
    <View style={styles.container}>
      {/* Dark overlay */}
      <View style={styles.overlay}>
        {/* Cut out hole for the highlighted element */}
        {renderSpotlight()}
      </View>
      
      {/* Tooltip */}
      <Animated.View 
        style={[
          styles.tooltipContainer, 
          tooltipPosition,
          { 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={stepInfo.icon} size={32} color="#ffffff" />
        </View>
        
        <Text style={styles.titleText}>{stepInfo.title}</Text>
        <Text style={styles.descriptionText}>{stepInfo.description}</Text>
      </Animated.View>
      
      {/* Navigation controls */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={onComplete}
        >
          <Text style={styles.skipText}>Geç</Text>
        </TouchableOpacity>
        
        <View style={styles.dotsContainer}>
          {[1, 2, 3, 4, 5].map(dotStep => (
            <View 
              key={dotStep} 
              style={[
                styles.dot, 
                dotStep === step ? styles.activeDot : null
              ]} 
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={nextStep}
        >
          <Text style={styles.nextText}>
            {step === 5 ? 'Anladım' : 'İleri'}
          </Text>
          <Ionicons 
            name={step === 5 ? "checkmark" : "arrow-forward"} 
            size={18} 
            color="white" 
            style={{ marginLeft: 5 }} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  tooltipContainer: {
    position: 'absolute',
    width: 280,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: blueColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: blueColor,
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 15,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: orangeColor,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nextButton: {
    backgroundColor: blueColor,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChatOnboarding;