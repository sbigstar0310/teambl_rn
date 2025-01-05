import { sharedStyles } from "@/app/_layout";
import {Redirect, useRouter} from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

/**
 * 
 * profile index page 
 * 
 * TODO: If the id is not given, redirect to the my page.
 * 
*/
export default function InboxScreen() {

    const router = useRouter();
    
    const [inputId, setInputId] = useState("");

    const onChangeText = (text: string) => {
        setInputId(text);
    };

    const onPress = () => {
        if (inputId) {
            router.push(`/profiles/${inputId}`);
        }
    };

    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding, styleSheet.gap]}>
            <Text>Please insert the id of the user.</Text>
            <Text>(My id : 1)</Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={onChangeText}
                value={inputId}
            />
            <Button
                onPress={onPress}
                title="Go to profile"
                color="#841584"
            />
        </View>
    )
}

const styleSheet = StyleSheet.create({
    gap : {
        gap: 10
    }
});