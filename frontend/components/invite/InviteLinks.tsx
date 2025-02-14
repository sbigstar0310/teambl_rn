import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import InviteLinkModal from "./InviteLinkModal";
import createInvitationLink from "@/libs/apis/InvitationLink/createInvitationLink";
import eventEmitter from "@/libs/utils/eventEmitter";
import dayjs from "dayjs";

export default function InviteLinks() {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState("");
    const [inviteLink, setInviteLink] = useState<api.InvitationLink>();
    const [isLoading, setIsLoading] = useState(false);

    const createInviteLink = async () => {
        // name이 비어있으면 함수 종료
        if (!name) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await createInvitationLink({ name: name });
            setInviteLink(response);
            setModalVisible(true);
            eventEmitter.emit("handleInvite");
        } catch (error) {
            console.error("Error creating invite link:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getExpirationDate = (created_at: Date) => {
        const expDate = new Date(
            new Date(created_at).getTime() + 7 * 24 * 60 * 60 * 1000
        );
        return dayjs(expDate).format("YYYY.MM.DD HH:mm까지");
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>초대 링크 생성</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="초대자 이름 입력"
                    placeholderTextColor="#A8A8A8"
                    value={name}
                    onChangeText={setName}
                />
                <TouchableOpacity
                    style={[
                        styles.button,
                        name ? styles.buttonActive : styles.buttonDisabled,
                    ]}
                    disabled={!name || isLoading}
                    onPress={createInviteLink}
                >
                    <Text style={styles.buttonText}>링크 생성</Text>
                </TouchableOpacity>
            </View>

            <InviteLinkModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                inviteeName={name}
                expirationDate={inviteLink ? getExpirationDate(inviteLink.created_at) : ""}
                inviteLink={inviteLink?.link ?? ""}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 16,
    },
    title: {
        fontSize: 16,
        fontFamily: "PretendardSemiBold",
        color: "#121212",
        lineHeight: 19,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: "#F5F5F5",
        borderRadius: 5,
        paddingHorizontal: 12,
        fontSize: 14,
        fontFamily: "PretendardRegular",
        color: "#121212",
    },
    button: {
        height: 40,
        paddingHorizontal: 12,
        marginLeft: 8,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#A8A8A8",
    },
    buttonActive: {
        backgroundColor: "#0923A9",
    },
    buttonText: {
        fontSize: 14,
        fontFamily: "PretendardSemiBold",
        color: "#FFFFFF",
        lineHeight: 19,
    },
});
