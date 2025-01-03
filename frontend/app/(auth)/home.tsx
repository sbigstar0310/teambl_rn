import { Button, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { sharedStyles } from "./_layout";
import React from "react";

export default function HomeScreen() {
    return (
        <>
            <Stack.Screen options={{ headerTitle: "Home" }} />
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.title}>Home Screen</Text>
                <Button
                    title="Go to Notification"
                    onPress={() => router.push("/notification")}
                />
                <Button
                    title="Go to Settings"
                    onPress={() => router.push("/settings")}
                />
                <Button
                    title="Go to Profile"
                    onPress={() => router.push("/profile")}
                />
                <Button
                    title="Go to Search"
                    onPress={() => router.push("/search")}
                />
                <Button
                    title="Go to Messages Inbox"
                    onPress={() => router.push("/inbox")}
                />
                <Button
                    title="Go to Login"
                    onPress={() => router.push("/login")}
                />
                <Button
                    title="Go to Signup"
                    onPress={() => router.push("/signup")}
                />
            </View>
        </>
    );
}