import React from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import ModalTopBar from "@/assets/modal-top-bar.svg";
import { sharedStyles } from "@/app/_layout";

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  heightPercentage?: number; // Height as a percentage of screen height (default: 33%)
  body: React.ReactNode;
}

const BottomModal: React.FC<BottomModalProps> = ({
  visible,
  onClose,
  heightPercentage = 0.33,
  body,
}) => {
  const screenHeight = Dimensions.get("window").height;
  const modalHeight = screenHeight * heightPercentage;

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { height: modalHeight }]}>
              <ModalTopBar style={[styles.modalTopBar]} />
              {body}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalTopBar: {
    width: 40,
    height: 4,
    alignSelf: "center",
    marginBottom: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingHorizontal: 32,
  },
});

export default BottomModal;
