import {Button, Text, View} from "react-native";
import {router} from "expo-router";
import {sharedStyles} from "@/app/_layout";

export default function SignUpScreen() {
    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding]}>
            <Text>Signup Screen</Text>
            <Button
                title="Go to Main (Home)"
                onPress={() => router.replace("/home")}
            />
        </View>
    )
}