import {Button, Text, View} from "react-native";
import {router, Stack} from "expo-router";
import {sharedStyles} from "@/app/_layout";
import {Fragment} from "react";

export default function SignUpScreen() {
    return (
        <Fragment>
            <Stack.Screen options={{headerShown: false}}/>
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.title}>Signup Screen</Text>
                <Button
                    title="Go to Main (Home)"
                    onPress={() => router.replace("/home")}
                />
            </View>
        </Fragment>
    )
}