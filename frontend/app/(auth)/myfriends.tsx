import React, { useState, } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyFriendsHeader from "@/components/friends/MyFriendsHeader";
import MyFriendsTabs from "@/components/friends/MyFriendsTabs";

export default function MyFriendsScreen() {
    const [activeTab, setActiveTab] = useState<"나의 1촌" | "내게 신청한">(
        "나의 1촌"
    );
    const [loading, setLoading] = useState(false); // 로딩 상태 추가


    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["top"]}
        >
            {/* 로딩 모달 */}
            <Modal visible={loading} transparent>
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            </Modal>

            {/* 상단 헤더 */}
            <MyFriendsHeader/>

            {/* 탭 메뉴 */}
            <MyFriendsTabs
                tabs={["나의 1촌", "내게 신청한"]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* 탭 내용 */}
            <View style={styles.contentContainer}>
                {activeTab === "나의 1촌" && (
                    <View>
                        <Text style={styles.resultCount}>총 1명</Text>
                    </View>
                )}
                {activeTab === "내게 신청한" && (
                    <View>
                        <Text style={styles.resultCount}>총 1명</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    resultCount: {
        fontSize: 14,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 17,
        color: "#595959",
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
});
