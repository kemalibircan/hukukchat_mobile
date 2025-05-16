import React from 'react';
import {
  View,
  TextInput,
  StyleSheet
} from 'react-native';

const TextInputCard = ({ text, setText }) => (
  <View style={styles.textInputCardContainer}>
    <View style={styles.textInputCard}>
      <TextInput
        style={styles.textInput}
        multiline={true}
        placeholder="Metninizi buraya yapıştırın..."
        placeholderTextColor="#6B7C93"
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  textInputCardContainer: {
    marginBottom: 16,
  },
  textInputCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  textInput: {
    padding: 16,
    minHeight: 150,
    fontSize: 16,
    color: '#193353',
  },
});

export default TextInputCard;