import React from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ViewStyle,
} from "react-native";
import ModalTopBarImage from "@/assets/modal-top-bar.svg";
import { sharedStyles } from "@/app/_layout";
import styled from "@emotion/native";

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  heightPercentage?: number; // Height as a percentage of screen height (default: 33%)
  body: React.ReactNode;
  style?: ViewStyle;
}

const Overlay = styled(View)`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContainer = styled(View)`
  width: 100%;
  background-color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  padding-horizontal: 32px;
`;

const ModalTopBar = styled(ModalTopBarImage)`
  width: 40px;
  height: 4px;
  align-self: center;
  margin-bottom: 16px;
`;

const BottomModal: React.FC<BottomModalProps> = ({
  visible,
  onClose,
  heightPercentage = 0.33,
  body,
  style,
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
      style={style}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Overlay>
          <TouchableWithoutFeedback>
            <ModalContainer style={{ height: modalHeight }}>
              <ModalTopBar />
              {body}
            </ModalContainer>
          </TouchableWithoutFeedback>
        </Overlay>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomModal;
