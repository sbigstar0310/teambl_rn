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

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  heightPercentage?: number; // Height as a percentage of screen height (default: 33%)
  body: React.ReactNode;
  style?: ViewStyle;
}

const ModalContainer = styled(Animated.View)`
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
  heightPercentage = 0.4,
  body,
  style,
}) => {
  const { height } = Dimensions.get("window");
  const modalHeight = height * heightPercentage;

  const overlayOpacity = useRef(new Animated.Value(0)).current; // Overlay opacity animation
  const translateY = useRef(new Animated.Value(height)).current; // Container slide animation

  useEffect(() => {
    if (visible) {
      // Show modal with animations
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: height - modalHeight,
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
        Animated.timing(translateY, {
          toValue: height,
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
      Animated.timing(translateY, {
        toValue: height,
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
                height: modalHeight,
                transform: [{ translateY }], // Slide animation
              }}
            >
              <ModalTopBar />
              {body}
            </ModalContainer>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomModal;
