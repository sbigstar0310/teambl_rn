import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import React from 'react';
import {StyleSheet} from "react-native";

export default function RootLayout() {
    return <React.Fragment>
        {/* Main Stack navigation router */}
        <Stack/>
        <StatusBar style="light" translucent={false} backgroundColor="black"/>
    </React.Fragment>;
}

export const sharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
})