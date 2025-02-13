import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as Clipboard from 'expo-clipboard';
import LinkIcon from "@/assets/invite/LinkIcon.svg";
import Popup from "@/components/Popup";

type InviteCardProps = {
    name: string;
    status: "대기" | "만료" | "완료";
    expirationDate?: string;
    inviteLink: string;
    inviteRecall?: any;
    userid?: number;
};

export default function InviteCard({ name, status, expirationDate, inviteLink, inviteRecall, userid }: InviteCardProps) {

    const handleCopyLink = () => {
        Clipboard.setStringAsync(inviteLink);  // 클립보드에 링크 복사
        alert("링크가 복사되었습니다!");  // 알림을 통해 복사 완료 메시지 표시
    };
    const [isRecallPopupOpen, setIsRecallPopupOpen] = useState(false);

    return (
        <View style={styles.card}>
            {status === "완료" ? (
                <View>
                    {/* 상단 */}
                    <View style={styles.topRow}>
                        <View style={styles.topLeft}>
                            <Text style={styles.name}>{name}</Text>
                            <Text style={styles.completedText}>가입 완료</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => router.push(`/profiles/${userid}`)}
                        >
                            <Text style={styles.inviteRecall}>프로필 확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View>
                    {/* 상단 */}
                    <View style={styles.topRow}>
                        <Text style={styles.name}>{name}</Text>
                        <TouchableOpacity onPress={setIsRecallPopupOpen.bind(null, true)}>
                            <Text style={styles.inviteRecall}>초대 회수</Text>
                        </TouchableOpacity>
                    </View>
                    {/* 하단 */}
                    <View style={styles.bottomRow}>
                        <View style={styles.expirationContainer}>
                            <Text style={styles.expirationLabel}>링크 유효 기간</Text>
                            <Text style={styles.expirationDate}>
                                {status === "대기" ? `${expirationDate}` : "미가입 기간 만료"}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            disabled={status === "만료"} 
                            style={styles.copyButton}
                            onPress={handleCopyLink}
                        >
                            {(status === "만료") && <View style={styles.disabled}/>}
                            <LinkIcon />
                            <Text style={styles.copyButtonText}>링크 복사</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* 회수 팝업 */}
            <Popup
                isVisible={isRecallPopupOpen}
                onClose={setIsRecallPopupOpen.bind(null, false)}
                onConfirm={inviteRecall}
                title="초대를 회수할까요?"
                confirmLabel="회수"
                closeLabel="취소"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#F5F7FA",
        padding: 18,
        borderRadius: 5,
        marginBottom: 16,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    topLeft: {
        flexDirection: "row",
        alignItems: "center"
    },
    name: {
        fontSize: 16,
        fontFamily: "PretendardSemiBold",
        color: "#121212",
        lineHeight: 19,
    },
    completedText: {
        fontSize: 12,
        fontFamily: "PretendardRegular",
        color: "#121212",
        lineHeight: 15,
        marginLeft: 8,
    },
    inviteRecall: {
        fontSize: 12,
        fontFamily: "PretendardRegular",
        color: "#595959",
        lineHeight: 15,
        textDecorationLine: 'underline',
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
    },
    expirationContainer: {
        flexDirection: "column",
        justifyContent: "space-around",
        height: 40,
    },
    expirationLabel: {
        fontSize: 12,
        fontFamily: "PretendardRegular",
        color: "#595959",
        lineHeight: 15,
    },
    expirationDate: {
        fontSize: 12,
        fontFamily: "PretendardRegular",
        color: "#121212",
        lineHeight: 15,
    },
    copyButton: {
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    disabled: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        zIndex: 99,
        borderRadius: 5,
    },
    copyButtonText: {
        fontSize: 14,
        fontFamily: "PretendardSemiBold",
        color: "#121212",
        lineHeight: 17,
        marginLeft: 6,
    },
});
