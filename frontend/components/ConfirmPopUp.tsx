import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface ConfirmPopUpProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  message: string;
  onConfirm: () => void;
  onReject: () => void;
  confirmLabel: string;
  rejectLabel: string;
  isCrucial?: boolean;
}

const ConfirmPopUp: React.FC<ConfirmPopUpProps> = ({
  isOpen,
  setIsOpen,
  message,
  onConfirm,
  onReject,
  confirmLabel,
  rejectLabel,
  isCrucial,
}) => {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={() => setIsOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          {/* Confirmation message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={isCrucial == null ? onReject : isCrucial ? onConfirm : onReject}
            >
              <Text style={styles.rejectButtonText}>
                {isCrucial == null ? rejectLabel : isCrucial ? confirmLabel : rejectLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={isCrucial == null ? onConfirm : isCrucial ? onReject : onConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {isCrucial == null ? confirmLabel : isCrucial ? rejectLabel : confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 48,
    paddingHorizontal: 0,
  },
  messageContainer: {
    paddingHorizontal: '10%',
    marginBottom: 31,
  },
  message: {
    color: '#121212',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.304,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  button: {
    width: 100,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {},
  confirmButtonText: {
    color: '#2546F3',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.304,
  },
  rejectButton: {},
  rejectButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.304,
  },
});

export default ConfirmPopUp;