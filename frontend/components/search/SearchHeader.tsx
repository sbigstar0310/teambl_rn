import { View, TextInput, StyleSheet } from "react-native";
import React from "react";
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";

export default function SearchHeader() {
    return (
        <View style={styles.headerContainer}>
            <LeftArrowIcon width={20} height={16} />
            <TextInput
                style={styles.searchInput}
                placeholder="찾으시는 사람 또는 프로젝트가 있나요?"
                placeholderTextColor="#A8A8A8"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 19,
    },
});
