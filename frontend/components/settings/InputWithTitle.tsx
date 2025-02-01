import { TextInput, Text, View, StyleSheet } from "react-native";

type InputWithTitleProps = {
    title: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    infoMessage?: string;
    style?: object;
};

const InputWithTitle: React.FC<InputWithTitleProps> = ({
    title,
    value,
    onChangeText,
    secureTextEntry,
    style,
}) => (
    <View style={[styles.inputContainer, style]}>
        <Text style={styles.title}>{title}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
        />
    </View>
);

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
        gap: 16,
    },
    title: {
        fontSize: 16,
        fontFamily: "Pretendard",
        fontWeight: "400",
        marginBottom: 8,
        minWidth: 112,
        textAlign: "left",
        alignSelf: "center",
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
});

export default InputWithTitle;
