import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type InviteTabsProps = {
    tabs: Array<"가입 대기" | "기간 만료" | "가입 완료">;
    activeTab: "가입 대기" | "기간 만료" | "가입 완료";
    setActiveTab: React.Dispatch<React.SetStateAction<"가입 대기" | "기간 만료" | "가입 완료">>;
};

export default function InviteTabs({ tabs, activeTab, setActiveTab }: InviteTabsProps) {
    return (
        <View style={styles.tabsContainer}>
            <Text style={styles.tabTitle}>초대 현황</Text>
            <View style={styles.container}>
                {tabs.map((tab, index) => (
                    <View 
                        key={tab}
                        style={styles.container}
                    >
                        <TouchableOpacity onPress={() => setActiveTab(tab)} >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab && styles.activeTabText,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                        {(index < tabs.length - 1) && <Text style={styles.separator}>|</Text>}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 16,
    },
    tabTitle: {
        fontSize: 16,
        fontFamily: "PretendardSemiBold",
        fontStyle: "normal",
        color: "#121212",
        lineHeight: 19,
    },
    tabText: {
        fontSize: 14,
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        color: "#A8A8A8",
        lineHeight: 19,
    },
    activeTabText: {
        color: "#121212",
    },
    container: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    separator: {
        fontSize: 18,
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        color: "#A8A8A8",
        lineHeight: 20,
        marginHorizontal: 8,
    },
});
