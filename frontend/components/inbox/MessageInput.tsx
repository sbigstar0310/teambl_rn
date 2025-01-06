import {Image, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import PlusIcon from '@/assets/plus-icon.svg';
import SendIcon from '@/assets/send-icon.svg';
import {useMemo, useState} from "react";
import * as ImagePicker from 'expo-image-picker';

interface MessageInputProps {
    onSend: (text: string, image?: string) => void;
}

export default function MessageInput(props: MessageInputProps) {
    const [text, setText] = useState("");
    const [image, setImage] = useState<string>();
    const hasAttachment = useMemo(() => !!image, [image]);
    const canSend = useMemo(() => text || hasAttachment, [text, hasAttachment]);

    const handleAdd = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleRemoveAttachment = () => setImage(undefined);

    const handleSend = () => {
        if (!canSend) return;
        props.onSend(text, image);
        setText("");
        handleRemoveAttachment();
    }

    return (
        <View style={styles.container}>
            {/*    Image upload button */}
            <TouchableOpacity
                style={[sharedStyles.contentCentered, styles.button]}
                onPress={hasAttachment ? handleRemoveAttachment : handleAdd}
            >
                {hasAttachment ? <Image
                    style={sharedStyles.roundedSm}
                    source={{uri: image}}
                    width={36}
                    height={36}
                /> : <PlusIcon/>}

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
                style={[sharedStyles.contentCentered, styles.button, !canSend && styles.disabled]}
                onPress={handleSend}
            >
                <SendIcon/>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 8,
        flexDirection: "row",
        alignItems: "flex-end"
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
    },
    disabled: {
        opacity: 0.5
    }
})