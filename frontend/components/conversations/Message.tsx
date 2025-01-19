import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";

import TickIcon from '@/assets/conversations/tick-icon.svg';
import {sharedStyles} from "@/app/_layout";
import ImagePreview from "@/components/conversations/ImagePreview";
import {Fragment, useState} from "react";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import {runOnJS} from "react-native-reanimated";
import Popup from "@/components/Popup";

interface MessageProps {
    isSentByMe: boolean;
    message: api.Message;
    onDelete: () => void;
}

export default function Message(props: MessageProps) {
    const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
    const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);

    const text = props.message.message;
    const image = props.message.image;
    const isUnread = !props.message.is_read;
    const time = props.message.created_at.toLocaleTimeString("ko", {
        // hour12: false, /* Uncomment if you want to see the time in 24h format */
        hour: "numeric",
        minute: "2-digit",
    });

    const handleImagePreviewOpen = () => setIsImagePreviewVisible(true);
    const handleImagePreviewClose = () => setIsImagePreviewVisible(false);
    const handleDeletePopupOpen = () => props.isSentByMe && setIsDeletePopupVisible(true);
    const handleDeletePopupClose = () => setIsDeletePopupVisible(false);

    const handleDelete = () => {
        props.onDelete();
        handleDeletePopupClose();
    }

    const longPressGesture = Gesture.LongPress()
        .onEnd(() => {
            'worklet';
            runOnJS(handleDeletePopupOpen)();
        });

    return (
        <GestureHandlerRootView style={[styles.container, props.isSentByMe && styles.byMeContainer]}>
            {/* Text display box */}
            <GestureDetector gesture={longPressGesture}>
                <View
                    style={[sharedStyles.roundedSm, styles.textbox, props.isSentByMe ? styles.byMeTextbox : styles.byHimTextbox, text && styles.padding]}>
                    {image && (<Fragment>
                        <TouchableOpacity onPress={handleImagePreviewOpen}>
                            <Image
                                source={{uri: image}}
                                style={[sharedStyles.roundedSm, styles.image, text && styles.imageWithText]}
                            />
                        </TouchableOpacity>
                        <ImagePreview isVisible={isImagePreviewVisible} onClose={handleImagePreviewClose}
                                      imageUri={image}/>
                    </Fragment>)}
                    {text && <Text style={[styles.text, image && styles.textWithImage]}>{text}</Text>}
                </View>
            </GestureDetector>
            {/* Extra Details */}
            {/* Time */}
            <Text style={sharedStyles.secondaryText}>{time}</Text>
            {/* Unread indicator */}
            {isUnread && props.isSentByMe && <TickIcon/>}
            <Popup
                title="이 메시지를 삭제하시겠습니까?"
                description="메시지는 채팅에서 '메시지 삭제'로 표시됩니다."
                onConfirm={handleDelete}
                confirmLabel="삭제"
                isVisible={isDeletePopupVisible}
                onClose={handleDeletePopupClose}
                confirmLabelColor="#B80000"
            />
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 4
    },
    byMeContainer: {
        flexDirection: "row-reverse"
    },
    padding: {
        paddingBottom: 8
    },
    textbox: {
        maxWidth: "75%"
    },
    byHimTextbox: {
        backgroundColor: "#F5F5F5"
    },
    byMeTextbox: {
        backgroundColor: "#EEF4FF"
    },
    text: {
        marginTop: 8,
        marginHorizontal: 8
    },
    textWithImage: {
        marginTop: 4
    },
    image: {
        width: "100%",
        flex: 1,
        aspectRatio: 4 / 3,
    },
    imageWithText: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    }
})