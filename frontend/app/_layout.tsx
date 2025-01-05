import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {Fragment} from 'react';
import {StyleSheet} from "react-native";

export default function RootLayout() {
    return <Fragment>
        {/* Main Stack navigation router */}
        <Stack screenOptions={{headerShown: false}}/>
        <StatusBar style="light" translucent={false} backgroundColor="black"/>
    </Fragment>;
}

export const sharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    horizontalPadding: {
        paddingHorizontal: 16
    },
    contentCentered: {
        justifyContent: "center",
        alignItems: "center"
    },
    primaryText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    secondaryText: {
        fontSize: 12,
        color: "gray"
    },
    rounded: {
        borderRadius: 500
    },
})