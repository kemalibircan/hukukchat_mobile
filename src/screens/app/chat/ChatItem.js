import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import Markdown from 'react-native-markdown-display';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { blueColor, orangeColor } from "../../../statics/color";

const LoadingAnimation = () => {
  const animations = [...Array(3)].map(() => useRef(new Animated.Value(0)).current);
  
  useEffect(() => {
    const animate = (index) => {
      Animated.sequence([
        Animated.timing(animations[index], {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animations[index], {
          toValue: 0,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ]).start(() => {
        animate(index);
      });
    };

    animations.forEach((_, index) => {
      setTimeout(() => animate(index), index * 150);
    });
    
    return () => animations.forEach(anim => anim.stopAnimation());
  }, []);

  return (
    <View style={styles.loadingContainer}>
      {animations.map((anim, index) => (
        <Animated.View 
          key={index}
          style={[
            styles.dot, 
            {
              transform: [{ 
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8]
                }) 
              }]
            }
          ]}
        />
      ))}
    </View>
  );
};

const ChatItem = ({ item }) => {
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);

  const handleCopyText = (text) => {
    Clipboard.setString(text);
    setIsMenuVisible(false);
  };

  const gosterme = (str) => {
    if (str.length <= 4) {
      return "";
    } else {
      return str.slice(0, -4);
    }
  };

  // Check if owner is "Ai" (case sensitive)
  const isAi = item.owner === "Ai";
  
  console.log("Message owner:", item.owner, "isAi:", isAi); // Add this for debugging

  if (item.title.slice(-4) === "null") {
    return (
      <View style={[styles.messageWrapper, isAi ? styles.aiWrapper : styles.userWrapper]}>
        <View style={[styles.messageBubble, isAi ? styles.aiBubble : styles.userBubble]}>
          <Text style={isAi ? styles.aiText : styles.userText}>
            {gosterme(item.title)}
          </Text>
        </View>
      </View>
    );
  } else if (item.title === "loading") {
    return (
      <View style={[styles.messageWrapper, styles.aiWrapper]}>
        <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
          <LoadingAnimation />
        </View>
      </View>
    );
  } else {
    return (
      <View style={[styles.messageWrapper, isAi ? styles.aiWrapper : styles.userWrapper]}>
        <TouchableOpacity
          style={[styles.messageBubble, isAi ? styles.aiBubble : styles.userBubble]}
          onLongPress={() => setIsMenuVisible(true)}
          activeOpacity={0.8}
        >
          <Markdown style={styles.markdownStyle}>
            {item.title}
          </Markdown>
          {isMenuVisible && (
            <Menu opened={true} onBackdropPress={() => setIsMenuVisible(false)}>
              <MenuTrigger />
              <MenuOptions style={styles.menuOptions}>
                <MenuOption onSelect={() => handleCopyText(item.title)}>
                  <View style={styles.menuOptionItem}>
                    <Ionicons name="clipboard-outline" size={18} color={orangeColor} />
                    <Text style={styles.menuOptionText}>Kopyala</Text>
                  </View>
                </MenuOption>
              </MenuOptions>
            </Menu>
          )}
        </TouchableOpacity>
      </View>
    );
  }
};

export default ChatItem;

const styles = StyleSheet.create({
  messageWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: '100%',
    backgroundColor: 'white',
  },
  aiWrapper: {
    alignItems: 'flex-start',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '100%',
    minWidth: 60,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  aiBubble: {
    backgroundColor: '#F0F2F5',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#E3F2FD',
    borderTopRightRadius: 4,
  },
  loadingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  aiText: {
    color: blueColor,
    fontWeight: '400',
    fontSize: 15,
  },
  userText: {
    color: orangeColor,
    fontWeight: '400',
    fontSize: 15,
  },
  markdownStyle: {
    body: {
      color: 'black',
      fontWeight: '400',
      fontSize: 15,
    },
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: blueColor,
    marginHorizontal: 3,
  },
  menuOptions: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 3,
  },
  menuOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuOptionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: blueColor,
  },
});