import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Dimensions,
  ViewStyle,
} from "react-native";
import ModalTopBarImage from "@/assets/modal-top-bar.svg";
import styled from "@emotion/native";

interface SideModalProps {
  visible: boolean;
  onClose: () => void;
  widthPercentage?: number; // Width as a percentage of screen width (default: 80%)
  fixedWidth?: number;
  body: React.ReactNode;
  style?: ViewStyle;
}

const ModalContainer = styled(Animated.View)`
  height: 100%;
  background-color: white;
  padding: 20px;
  padding-horizontal: 32px;
  position: absolute;
  left: 0;
  top: 0;
`;

const ModalTopBar = styled(ModalTopBarImage)`
  width: 40px;
  height: 4px;
  align-self: center;
  margin-bottom: 16px;
`;

const SideModal: React.FC<SideModalProps> = ({
  visible,
  onClose,
  widthPercentage = 0.8,
  fixedWidth = null,
  body,
  style,
}) => {
  const { width } = Dimensions.get("window");
  const modalWidth = fixedWidth || width * widthPercentage; // Modal width

  const overlayOpacity = useRef(new Animated.Value(0)).current; // Overlay opacity animation
  const translateX = useRef(new Animated.Value(-modalWidth)).current; // Container slide animation

  useEffect(() => {
    if (visible) {
      // Show modal with animations
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide modal with animations
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateX, {
          toValue: -modalWidth,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(translateX, {
        toValue: -modalWidth,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none" // Disable default modal animation
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: overlayOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5)"],
            }),
          }}
        >
          <TouchableWithoutFeedback>
            <ModalContainer
              style={{
                width: modalWidth,
                transform: [{ translateX }], // Slide animation from left
              }}
            >
              {body}
            </ModalContainer>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SideModal;
