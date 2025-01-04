import React from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

interface MessagePopUpProps {
  setIsOpen: (isOpen: boolean) => void;
  message: string;
  subMessages?: string[];
  confirmCallback?: () => void;
}

const MessagePopUp: React.FC<MessagePopUpProps> = ({ setIsOpen, message, subMessages, confirmCallback }) => {
  return (
    <Modal
      transparent
      visible={true}
      animationType="fade"
      onRequestClose={() => setIsOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Main Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Sub Messages */}
          {subMessages && (
            <View style={styles.subMessageContainer}>
              {subMessages.map((subMessage, index) => (
                <Text key={index} style={styles.subMessage}>
                  {subMessage}
                </Text>
              ))}
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={async () => {
              setIsOpen(false);
              if (confirmCallback) {
                await confirmCallback();
              }
            }}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
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
  content: {
    backgroundColor: '#FFF',
    paddingVertical: 48,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 350,
    maxWidth: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  subMessageContainer: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  subMessage: {
    color: '#595959',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  confirmButton: {
    marginTop: 26,
    width: 100,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  confirmButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MessagePopUp;
