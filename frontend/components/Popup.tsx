import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import theme from "@/shared/styles/theme";

interface PopupProps {
    title: string;
    description?: string;
    isVisible: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    closeLabel?: string;
    closeLabelColor?: string;
    confirmLabel?: string;
    confirmLabelColor?: string;
}

export default function Popup({
                                  title,
                                  description,
                                  isVisible,
                                  onClose,
                                  onConfirm,
                                  closeLabel = "취소",
                                  closeLabelColor = theme.colors.black,
                                  confirmLabel = "확인",
                                  confirmLabelColor = theme.colors.point
                              }: PopupProps) {
    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                    </View>

                    {description &&
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>
                                {description}
                            </Text>
                        </View>
                    }

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <Text style={[styles.buttonText, {color: closeLabelColor}]}>{closeLabel}</Text>
                        </TouchableOpacity>
                        {onConfirm &&
                            <TouchableOpacity
                                style={styles.button}
                                onPress={onConfirm}
                            >
                                <Text style={[styles.buttonText, {color: confirmLabelColor}]}>{confirmLabel}</Text>
                            </TouchableOpacity>
                        }
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
    content: {
        backgroundColor: '#FFF',
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: 350,
        maxWidth: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        width: '100%',
        textAlign: 'center',
        marginVertical: 16,
    },
    title: {
        color: '#121212',
        fontSize: 16,
        fontFamily: "PretendardSemiBold",
        lineHeight: 19,
        textAlign: 'center',
    },
    descriptionContainer: {
        width: '90%',
        alignItems: 'center',
    },
    description: {
        color: '#595959',
        fontSize: 12,
        fontFamily: "PretendardRegular",
        lineHeight: 15,
        textAlign: 'center',
        marginBottom: 4,
    },
    buttonsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: 12,
    },
    button: {
        width: 100,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    buttonText: {
        color: '#121212',
        fontSize: 16,
        fontFamily: "PretendardSemiBold",
        lineHeight: 19,
    }
});