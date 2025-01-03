import {Text, View} from "react-native";
import {sharedStyles} from "./_layout";
import React, {Fragment} from "react";
import {Stack} from "expo-router";

export default function SearchScreen() {
    return (
        <Fragment>
            <Stack.Screen options={{headerTitle: "Search"}}/>
            <View style={sharedStyles.container}>
                <Text>Search Screen</Text>
            </View>
        </Fragment>
    )
}