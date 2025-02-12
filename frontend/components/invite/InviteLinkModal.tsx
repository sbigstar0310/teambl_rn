import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet  } from "react-native";
import * as Clipboard from 'expo-clipboard';
import LinkIcon from "@/assets/invite/LinkIcon.svg";
import CloseIcon from "@/assets/invite/CloseIcon.svg";

interface InviteLinkModalProps {
    visible: boolean;
    onClose: () => void;
    inviteeName: string;
    expirationDate: string;
    inviteLink: string;
}

export default function InviteLinkModal({ visible, onClose, inviteeName, expirationDate, inviteLink }: InviteLinkModalProps) {
    
    const handleCopyLink = () => {
        Clipboard.setStringAsync(inviteLink);  // 클립보드에 링크 복사
        alert("링크가 복사되었습니다!");  // 알림을 통해 복사 완료 메시지 표시
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* 닫기 버튼 */}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <CloseIcon />
                    </TouchableOpacity>

                    {/* 설명 텍스트 */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>초대 링크가 생성되었습니다.</Text>
                        <Text style={styles.title}>링크를 복사해 초대 상대에게 공유해 주세요.</Text>
                    </View>
                    
                    {/* 구분선 */}
                    <View style={styles.separator} />

                    {/* 초대자 이름 */}
                    <Text style={styles.inviteeName}>{inviteeName}</Text>

                    {/* 링크 유효기간 & 복사 버튼 */}
                    <View style={styles.footerContainer}>
                        <View style={styles.expirationContainer}>
                            <Text style={styles.expirationLabel}>링크 유효 기간</Text>
                            <Text style={styles.expirationDate}>{expirationDate}</Text>
                        </View>
                        <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
                            <LinkIcon />
                            <Text style={styles.copyButtonText}>링크 복사</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 30,
    },
    closeButton: {
        position: "absolute",
        top: 0,
        right: 0,
        padding: 18,
    },
    titleContainer: {
        marginVertical: 18
    },
    title: {
        fontSize: 16,
        fontFamily: "PretendardRegular",
        color: "#121212",
        lineHeight: 19,
    },
    separator: {
        height: 1,
        backgroundColor: "#D9D9D9",
        marginVertical: 3
    },
    inviteeName: {
        fontSize: 16,
        fontFamily: "PretendardSemiBold",
        color: "#121212",
        lineHeight: 19,
        marginVertical: 18
    },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    copyButtonText: {
        fontSize: 14,
        marginLeft: 6,
        fontWeight: "600",
    },
});
