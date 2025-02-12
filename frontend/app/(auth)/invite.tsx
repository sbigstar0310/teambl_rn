import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InviteHeader from "@/components/invite/InviteHeader";
import InviteTabs from "@/components/invite/InviteTabs";
import InviteLinks from "@/components/invite/InviteLinks";
import InviteCard from "@/components/invite/InviteCard";


export default function MyFriendsScreen() {
    const [activeTab, setActiveTab] = useState<"가입 대기" | "기간 만료" | "가입 완료">(
        "가입 대기"
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
            <InviteHeader />

            {/* 초대 링크 */}
            <InviteLinks />

            {/* 탭 메뉴 */}
            <InviteTabs
                tabs={["가입 대기", "기간 만료", "가입 완료"]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* 탭 내용 */}
            <View style={styles.contentContainer}>
                {activeTab === "가입 대기" && (
                    <View>
                        <InviteCard
                            name={"이규원"}
                            status={"대기"}
                            expirationDate={"2025"}
                            inviteLink={"https"}
                            inviteRecall={async () => {
                                //TODO
                            }}
                        />
                        <InviteCard
                            name={"이규원"}
                            status={"대기"}
                            expirationDate={"2025"}
                            inviteLink={"https"}
                            inviteRecall={async () => {
                                //TODO
                            }}
                        />
                    </View>
                )}
                {activeTab === "기간 만료" && (
                    <View>
                        <InviteCard
                            name={"이규원"}
                            status={"만료"}
                            inviteLink={"https"}
                            inviteRecall={async () => {
                                //TODO
                            }}
                        />
                    </View>
                )}
                {activeTab === "가입 완료" && (
                    <View>
                        <InviteCard
                            name={"이규원"}
                            status={"완료"}
                            expirationDate={"2025"}
                            inviteLink={"https"}
                            userid={1}
                        />
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
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        lineHeight: 17,
        color: "#595959",
    },
    loadingOverlay: {
        flex:1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
});
