import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface TradeButtonsProps {
  onBuy: () => void;
  onSell: () => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    margin: 5, // Add some margin to separate the buttons
  },
});

export const TradeButtons: React.FC<TradeButtonsProps> = ({ onBuy, onSell }) => (
  <View style={styles.container}>
    <Button 
      style={styles.button} 
      contentStyle={{ height: 50 }} 
      mode="contained" 
      onPress={onBuy}
      buttonColor="#00ff00"
      textColor="black"
    >
      Add
    </Button>
    <Button 
      style={styles.button} 
      contentStyle={{ height: 50 }} 
      mode="contained" 
      onPress={onSell}
      buttonColor="red"
      textColor="black"
    >
      Remove
    </Button>
  </View>
);