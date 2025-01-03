import {Text, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import {Fragment} from "react";
import {Stack} from "expo-router";

export default function ProfileScreen() {
    return (
        <Fragment>
            <Stack.Screen options={{headerTitle: "Profile"}}/>
            <View style={sharedStyles.container}>
                <Text>Profile Screen</Text>
            </View>
        </Fragment>
    )
}