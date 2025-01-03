import {Button, Text, View} from "react-native";
import {router, Stack} from "expo-router";
import {sharedStyles} from "@/app/_layout";
import {Fragment} from "react";

export default function LoginScreen() {
    return (
        <Fragment>
            <Stack.Screen options={{headerShown: false}}/>
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.title}>Login Screen</Text>
                <Button
                    title="Go to Signup"
                    onPress={() => router.push("/signup")}
                />
                <Button
                    title="Go to Main (Home)"
                    onPress={() => router.replace("/home")}
                />
            </View>
        </Fragment>
    )
}