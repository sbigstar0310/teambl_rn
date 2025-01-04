import {Button, Text, View} from "react-native";
import {router} from "expo-router";
import {sharedStyles} from "@/app/_layout";

export default function LoginScreen() {
    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding]}>
            <Text>Login Screen</Text>
            <Button
                title="Go to Signup"
                onPress={() => router.push("/signup")}
            />
            <Button
                title="Go to Main (Home)"
                onPress={() => router.replace("/home")}
            />
        </View>
    )
}