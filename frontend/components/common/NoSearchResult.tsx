import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface NoSearchResultProps {
    title: string;
    message: string;
}

const NoSearchResult: React.FC<NoSearchResultProps> = ({ title, message }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontFamily: "PretendardSemiBold",
        textAlign: "center",
        color: "gray",
        fontSize: 18,
        marginBottom: 6,
    },
    message: {
        fontFamily: "PretendardRegular",
        textAlign: "center",
        color: "gray",
        fontSize: 18,
    },
});

export default NoSearchResult;
