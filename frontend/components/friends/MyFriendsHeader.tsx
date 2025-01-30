import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";
import { router } from "expo-router";

type MyFriendsHeaderProps = {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};

export default function SearchHeader() {
    return (
        <View style={styles.headerContainer}>
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <LeftArrowIcon/>
            </TouchableOpacity>
            <Text style={styles.title}>1촌</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    backButton: {
        marginRight: 20,
    },
    title: {
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: 20,
        lineHeight: 24,
        color: "#121212",
    },
});
