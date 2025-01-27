import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import theme from "@/shared/styles/theme";

interface TextFieldProps extends TextInputProps {
    disabled?: boolean;
    icon?: React.ReactNode;
}

export default function TextField(props: TextFieldProps) {
    return (
        <View style={styles.container}>
            {props.icon && props.icon}
            <TextInput
                style={styles.input}
                placeholderTextColor={theme.colors.achromatic03}
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.achromatic05,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        minHeight: 40,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
});
