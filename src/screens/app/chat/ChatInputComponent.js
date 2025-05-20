import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Text,
  Animated,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { blueColor } from '../../../statics/color';

const ChatInputComponent = ({ onSendMessage, onWebSearchToggle, isWebSearchEnabled, disabled,navigation }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef(null);
  const [sendButtonDisabled, setSendButtonDisabled] = useState(true);
  
  // Animation values
  const sendButtonScale = useRef(new Animated.Value(0)).current;
  const sendButtonOpacity = useRef(new Animated.Value(0)).current;
  const inputContainerOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start animation when component mounts
    Animated.timing(inputContainerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    if (inputText.trim().length === 0) {
      // Hide send button when input is empty
      Animated.parallel([
        Animated.timing(sendButtonScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sendButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
      
      setSendButtonDisabled(true);
    } else {
      // Show send button when input has text
      Animated.parallel([
        Animated.timing(sendButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sendButtonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
      
      setSendButtonDisabled(false);
    }
  }, [inputText]);
  
  const handleSend = () => {
    if (inputText.trim() === '' || disabled) return;
    
    // Pass the inputText directly to the parent component's handler
    onSendMessage(inputText);
    setInputText('');
    Keyboard.dismiss();
  };
  
  const handleToggleWebSearch = () => {
    if (onWebSearchToggle) {
      onWebSearchToggle(!isWebSearchEnabled);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.inputContainer, 
          { opacity: inputContainerOpacity }
        ]}
      >
        {/* Main input area */}
        <View style={styles.topInputArea}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Bir şeyler sorun..."
            placeholderTextColor="#9e9e9e"
            ref={inputRef}
            multiline={true}
            maxHeight={80}
          />
          
          <View style={styles.inputRightControls}>
            {inputText.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setInputText('')}>
                <Ionicons name="close-circle" size={18} color="#9e9e9e" />
              </TouchableOpacity>
            )}
            
            {/* Animated send button inside input area */}
            <Animated.View
              style={[
                styles.sendButtonContainer,
                { 
                  opacity: sendButtonOpacity,
                  transform: [{ scale: sendButtonScale }] 
                }
              ]}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (sendButtonDisabled || disabled) ? styles.sendButtonDisabled : {}
                ]}
                disabled={sendButtonDisabled || disabled}
                onPress={handleSend}>
                <FontAwesome5
                  name="paper-plane"
                  size={16}
                  color={(sendButtonDisabled || disabled) ? '#DCDCDC' : 'white'}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
        
        {/* Web search toggle in the same rectangle */}
        <View style={styles.webSearchRow}>
          <TouchableOpacity 
            style={[
              styles.webSearchToggle,
              isWebSearchEnabled ? styles.webSearchActive : styles.webSearchInactive
            ]}
            onPress={handleToggleWebSearch}>
            <Ionicons 
              name="globe" 
              size={14} 
              color={isWebSearchEnabled ? blueColor : "#888"} 
            />
            <Text style={[
              styles.webSearchText,
              isWebSearchEnabled ? styles.webSearchTextActive : styles.webSearchTextInactive
            ]}>
              {isWebSearchEnabled ? "Web araması açık" : "Web araması kapalı"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    width: '100%',
  },
  inputContainer: {
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ebebeb',
    overflow: 'hidden',
  },
  topInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  inputRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 6,
    marginRight: 5,
  },
  sendButtonContainer: {
    height: 34,
    width: 34,
    marginLeft: 2,
  },
  sendButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: blueColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  webSearchRow: {
    borderTopWidth: 1,
    borderTopColor: '#ebebeb',
    paddingVertical: 6,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
  },
  webSearchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  webSearchActive: {
    backgroundColor: `${blueColor}15`,
  },
  webSearchInactive: {
    backgroundColor: '#e5e5e5',
  },
  webSearchText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  webSearchTextActive: {
    color: blueColor,
  },
  webSearchTextInactive: {
    color: '#888',
  },
});

export default ChatInputComponent;