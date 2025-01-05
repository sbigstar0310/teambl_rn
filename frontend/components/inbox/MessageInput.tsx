import {StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import PlusIcon from '@/assets/plus-icon.svg';
import SendIcon from '@/assets/send-icon.svg';
import {useState} from "react";

interface MessageInputProps {
    onSend: (text: string, image?: string) => void;
}

export default function MessageInput(props: MessageInputProps) {
    const [text, setText] = useState("");
    const [image, setImage] = useState<string>();

    const handleAdd = () => {
        // TODO: handle image upload
    };

    const handleSend = () => {
        props.onSend(text, image);
        setText("");
    }

    return (
        <View style={styles.container}>
            {/*    Image upload button */}
            <TouchableOpacity
                style={[sharedStyles.contentCentered, styles.button]}
                onPress={handleAdd}
            >
                <PlusIcon/>
            </TouchableOpacity>
            {/*    Text input */}
            <TextInput
                style={styles.textInput}
                placeholder="메세지 보내기"
                multiline={true}
                textAlignVertical="top"
                numberOfLines={4}
                value={text}
                onChangeText={setText}
            />
            {/*    Send button */}
            <TouchableOpacity
                style={[sharedStyles.contentCentered, styles.button]}
                onPress={handleSend}
            >
                <SendIcon/>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingVertical: 10,
        gap: 8
    },
    button: {
        width: "10%",
        height: 36
    },
    textInput: {
        flexGrow: 1,
        width: "75%",
        padding: 10,
        backgroundColor: "#F5F5F5",
        borderRadius: 5,
        maxWidth: "80%"
    }
})