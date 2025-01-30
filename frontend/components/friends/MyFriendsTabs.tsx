import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type MyFriendsTabsProps = {
    tabs: Array<"나의 1촌" | "내게 신청한">;
    activeTab: "나의 1촌" | "내게 신청한";
    setActiveTab: React.Dispatch<React.SetStateAction<"나의 1촌" | "내게 신청한">>;
};

export default function MyFriendsTabs({ tabs, activeTab, setActiveTab }: MyFriendsTabsProps) {
    return (
        <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tabButton,
                        activeTab === tab && styles.activeTabButton,
                    ]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === tab && styles.activeTabText,
                        ]}
                    >
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 16,
        marginLeft: 16,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 24,
        backgroundColor: "#f5f5f5",
    },
    activeTabButton: {
        backgroundColor: "#333",
    },
    tabText: {
        fontSize: 16,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: 19,
        color: "#595959",
    },
    activeTabText: {
        color: "#fff",
    },
});
