import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface PrimeButtonProps {
  text: string;
  onClickCallback: () => Promise<void>;
  isActive: boolean;
  isLoading: boolean;
  styleOv?: ViewStyle;
}

/**
 * Re-usable button component with loading spinner
 */
const PrimeButton: React.FC<PrimeButtonProps> = ({ text, onClickCallback, isActive, isLoading, styleOv }) => {
  return (
    <TouchableOpacity
      style={[styles.primeButton, !isActive && styles.primeBtnDisabled, styleOv]}
      onPress={async () => await onClickCallback()}
      disabled={!isActive || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFF" style={styles.loader} />
      ) : (
        <Text style={styles.text}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primeButton: {
    width: '100%',
    height: 40,
    borderRadius: 5,
    backgroundColor: '#0923A9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primeBtnDisabled: {
    backgroundColor: '#A8A8A8',
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.304,
  },
  loader: {
    width: 20,
    height: 20,
  },
});

export default PrimeButton;
