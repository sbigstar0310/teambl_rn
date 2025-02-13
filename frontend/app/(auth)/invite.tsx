import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InviteHeader from "@/components/invite/InviteHeader";
import InviteTabs from "@/components/invite/InviteTabs";
import InviteLinks from "@/components/invite/InviteLinks";
import InviteCard from "@/components/invite/InviteCard";
import fetchInvitationLinks from "@/libs/apis/InvitationLink/fetchInvitationLinks";
import deleteInvitationLink from "@/libs/apis/InvitationLink/deleteInvitationLink";
import dayjs from "dayjs";
import eventEmitter from "@/libs/utils/eventEmitter";

export default function MyFriendsScreen() {
    const [activeTab, setActiveTab] = useState<
        "가입 대기" | "기간 만료" | "가입 완료"
    >("가입 대기");
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [invitationLinks, setInvitationLinks] = useState<
        api.InvitationLink[]
    >([]);

    useEffect(() => {
        fetchInvites();
        eventEmitter.on("handleInvite", fetchInvites);
        return () => {
          eventEmitter.off("handleInvite", fetchInvites);
        };
    }, []);

    const fetchInvites = async () => {
        try {
            setLoading(true);
            // 초대 목록 조회 API 호출
            const invitationLinks = await fetchInvitationLinks();
            setInvitationLinks(invitationLinks);
        } catch (error) {
            console.error("Error fetching invites:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteInvitationLink = async (id: number) => {
        try {
            setLoading(true);
            await deleteInvitationLink(id); // Using the imported function
            fetchInvites();
        } catch (error) {
            console.error("Error deleting invitation link:", error);
        } finally {
            setLoading(false);
        }
    };

    const getExpirationDate = (created_at: Date) => {
        const expDate = new Date(
            new Date(created_at).getTime() + 7 * 24 * 60 * 60 * 1000
        );
        return dayjs(expDate).format("YYYY.MM.DD HH:mm까지");
    };

    const filteredInvites = invitationLinks.filter((invitationLink) => {
        if (activeTab === "가입 대기")
            return invitationLink.status === "pending";
        if (activeTab === "기간 만료")
            return invitationLink.status === "expired";
        if (activeTab === "가입 완료")
            return invitationLink.status === "accepted";
        return false;
    });

    const statusChange = (status: string) => {
        switch (status) {
            case "가입 대기":
                return "대기";
            case "기간 만료":
                return "만료";
            case "가입 완료":
                return "완료";
            default:
                return "대기";
        }
    };

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
                <ScrollView>
                    {filteredInvites.map((invitationLink) => (
                        <InviteCard
                            key={invitationLink.id}
                            name={invitationLink.invitee_name}
                            status={statusChange(activeTab)}
                            expirationDate={getExpirationDate(
                                invitationLink.created_at
                            )}
                            inviteLink={invitationLink.link}
                            inviteRecall={() =>
                                handleDeleteInvitationLink(invitationLink.id)
                            }
                        />
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
});
