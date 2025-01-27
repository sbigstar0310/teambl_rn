import theme from '@/shared/styles/theme';
import React from 'react';
import {
    Modal,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImageUploadModal = (props: any) => {
    const {
        isVisible,
        onClose,
        title,
        descriptions,
        imageRemoveLabel = "사진 삭제하기",
        imageUploadLabel = "사진 올리기",
        onRemoveImage,
        onUploadImage
    } = props;

    const handleImageUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.status !== 'granted') {
            alert('사진을 업로드하려면 권한이 필요합니다.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            allowsMultipleSelection: false,
            presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedImage = result.assets[0];
            if (onUploadImage) {
                onUploadImage(selectedImage);
            }
        }
    };

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.keyboardAvoidingView}
                    >
                        <TouchableWithoutFeedback>
                            <View style={styles.content}>
                                <Text style={styles.title}>{title}</Text>
                                {
                                    descriptions.map((description: string, index: number) => (
                                        <Text key={index} style={styles.description}>{description}</Text>
                                    ))
                                }
                                <View style={styles.bottomButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.bottomButton}
                                        onPress={async () => {
                                            await onRemoveImage();
                                        }}
                                    >
                                        <Text
                                            style={[styles.bottomButtonText]}
                                        >
                                            {imageRemoveLabel}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.bottomButton}
                                        onPress={handleImageUpload}
                                    >
                                        <Text
                                            style={[styles.bottomButtonText, styles.withPrimaryColor]}
                                        >
                                            {imageUploadLabel}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
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
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: '#FFF',
        paddingVertical: 48,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: 350,
        maxWidth: '80%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title : {
        fontSize: theme.fontSizes.subtitle,
        fontWeight: 400,
        color: theme.colors.black,
        marginBottom: 12
    },
    description : {
        fontSize: theme.fontSizes.caption,
        fontWeight: 400,
        color: theme.colors.achromatic01
    },
    bottomButtonContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 30,
        padding: 0
    },
    bottomButton: {
        display: 'flex',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomButtonText: {
        fontSize: theme.fontSizes.body1,
        fontWeight: 700,
        color: theme.colors.black
    },
    withPrimaryColor: {
        color: theme.colors.main
    }
});

export default ImageUploadModal;
