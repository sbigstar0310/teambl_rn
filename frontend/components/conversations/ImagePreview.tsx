import {Modal, StyleSheet, TouchableOpacity, View} from "react-native";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {runOnJS, useAnimatedStyle, useSharedValue} from "react-native-reanimated";
import XIcon from '@/assets/x-icon.svg';

interface ImagePreviewProps {
    isVisible: boolean;
    onClose: () => void;
    imageUri: string;
}

export default function ImagePreview(props: ImagePreviewProps) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const offset = useSharedValue({x: 0, y: 0});
    const savedOffset = useSharedValue({x: 0, y: 0});

    const handleClose = () => {
        props.onClose();
        resetTransformations();
    }
    const resetTransformations = () => {
        scale.value = 1;
        offset.value = {x: 0, y: 0};
        savedScale.value = 1;
        savedOffset.value = {x: 0, y: 0};
    }
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            'worklet';
            const newScale = savedScale.value * e.scale;
            // Max: 5x, Min: 0.5x zoom
            if (newScale > 0.5 && newScale < 5) {
                scale.value = newScale;
            }
        })
        .onEnd(() => {
            'worklet';
            savedScale.value = scale.value;
        })
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            'worklet';
            runOnJS(resetTransformations)();
        })
    const panGesture = Gesture.Pan()
        .blocksExternalGesture(doubleTapGesture)
        .averageTouches(true)
        .onUpdate((e) => {
            'worklet';
            offset.value = {
                x: savedOffset.value.x + e.translationX,
                y: savedOffset.value.y + e.translationY
            };
        })
        .onEnd(() => {
            'worklet';
            savedOffset.value = offset.value;
        })
    const composedGesture = Gesture.Simultaneous(pinchGesture, doubleTapGesture, panGesture)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{scale: scale.value}, {translateX: offset.value.x}, {translateY: offset.value.y}]
    }));

    return (
        <Modal
            visible={props.isVisible}
            animationType="fade"
            onRequestClose={handleClose}
            transparent={true}
        >
            <GestureHandlerRootView>
                <GestureDetector gesture={composedGesture}>
                    <View style={styles.container}>
                        <TouchableOpacity style={styles.closeContainer} onPress={handleClose}>
                            <XIcon/>
                        </TouchableOpacity>
                        <Animated.Image
                            source={{uri: props.imageUri}}
                            style={[styles.image, animatedStyle]}
                        />
                    </View>
                </GestureDetector>
            </GestureHandlerRootView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    closeContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        top: 40,
        right: 20,
        position: "absolute"
    },
    image: {
        alignSelf: "center",
        width: "90%",
        aspectRatio: 4 / 3,
        resizeMode: "contain"
    }
})