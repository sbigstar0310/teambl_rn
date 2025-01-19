import {StyleSheet, TextInput, TextInputProps} from "react-native";
import theme from "@/shared/styles/theme";

interface TextFieldProps extends TextInputProps {
    disabled?: boolean;
}

export default function TextField(props: TextFieldProps) {
    return (
        <TextInput
            style={styles.input}
            editable={!props.disabled}
            placeholderTextColor={theme.colors.achromatic03}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.achromatic05,
        fontSize: 16
    }
});