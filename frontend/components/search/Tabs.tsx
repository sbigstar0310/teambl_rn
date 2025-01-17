import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type TabsProps = {
    tabs: Array<"사람" | "프로젝트 + 게시물">;
    activeTab: "사람" | "프로젝트 + 게시물";
    setActiveTab: React.Dispatch<React.SetStateAction<"사람" | "프로젝트 + 게시물">>;
};

export default function Tabs({ tabs, activeTab, setActiveTab }: TabsProps) {
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
        marginBottom: 16,
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
        backgroundColor: "#2546F3",
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
