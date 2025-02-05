import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type FilterTabsProps = {
    activeFilter: string | null;
    handleFilterChange: (filter: string | null) => void;
};

export default function ProjFilterTabs({ activeFilter, handleFilterChange }: FilterTabsProps) {
    return (
        <View style={styles.filterContainer}>
            {["프로젝트", "게시물"].map((filter, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.tabButton,
                        activeFilter === String(index + 1) && styles.activeTabButton,
                    ]}
                    onPress={() =>
                        handleFilterChange(activeFilter === String(index + 1) ? null : String(index + 1))
                    }
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeFilter === String(index + 1) && styles.activeTabText,
                        ]}
                    >
                        {filter}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 16,
        gap: 16,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 24,
        backgroundColor: "#f5f5f5",
    },
    activeTabButton: {
        backgroundColor: "#2546F3",
    },
    tabText: {
        fontSize: 16,
        fontFamily: "PretendardSemiBold",
        fontStyle: "normal",
        lineHeight: 19,
        color: "#595959",
    },
    activeTabText: {
        color: "#fff",
    },
});
