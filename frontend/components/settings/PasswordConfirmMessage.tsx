import { FC } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import ConfirmText from "@/components/ConfirmText";

type Props = {
    isVerified: boolean | null;
    isActive: boolean;
    infoMessage: string;
    style?: ViewStyle;
};

const PasswordConfirmMessage: FC<Props> = ({
    isVerified,
    isActive,
    infoMessage,
    style,
}) => {
    return (
        <View style={[styles.messageContainer, style]}>
            <View style={styles.placeholder} />
            <ConfirmText
                isVerified={isVerified ?? false}
                isActive={isActive}
                successText={infoMessage}
                errorText={infoMessage}
                containerStyle={styles.confirmText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    placeholder: {
        minWidth: 112, // Keeps alignment consistent
    },
    confirmText: {
        marginTop: 4,
    },
});

export default PasswordConfirmMessage;
