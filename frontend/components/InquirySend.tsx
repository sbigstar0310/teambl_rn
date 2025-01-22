import styled from "@emotion/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import PrimeButton from "./PrimeButton";
import Button from "./Button";

/** Teamble email */
const TEAMBLE_EMAIL = "contact.teambl.net";

const Container = styled.View`
    flex: 1;
    padding: 16px;
    background-color: #fff;
`;

const InquirySend: React.FC = () => {
    const [currentUserInfo, setCurrentUserInfo] = useState<{ email?: string }>({
        email: "user@example.com",
    });
    const [content, setContent] = useState<string>("");

    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /** fetch current user data */
    const fetchCurrentUser = async () => {
        setIsDataLoading(true);
        try {
            // Simulated API response
            setTimeout(() => {
                setCurrentUserInfo({ email: "user@example.com" });
                setIsDataLoading(false);
            }, 1000);
        } catch (e) {
            console.log(e);
            setCurrentUserInfo({
                email: "정보 수신에 실패했어요",
            });
            setIsDataLoading(false);
        }
    };

    /** save */
    const postNewInquiry = async () => {
        if (isLoading || isDataLoading || content === "") {
            return;
        }
        setIsLoading(true);
        try {
            // Simulated API response
            setTimeout(() => {
                setContent("");
                Alert.alert(
                    "성공",
                    "문의가 정상적으로 접수되었습니다. 확인하여 빠른 시일 내에 답변 드리겠습니다."
                );
                setIsLoading(false);
            }, 1000);
        } catch (e) {
            Alert.alert(
                "실패",
                "문의 등록에 실패했습니다. 서버 오류가 발생했습니다."
            );
            console.log(e);
            setIsLoading(false);
        }
    };

    /** effects */
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const openKakaoWebview = async () => {
        Linking.openURL("http://pf.kakao.com/_penxbn");
    };

    return (
        <Container>
            <Button
                text="카카오톡 문의하기"
                onClickCallback={openKakaoWebview}
                isActive={true}
                isLoading={false}
                style={{ backgroundColor: "#f9e000" }}
                textStyle={{ color: "#000", fontWeight: "bold" }}
            />
        </Container>
    );

    return (
        <View style={styles.container}>
            {/** from to view */}
            <Text
                style={styles.emailText}
            >{`받는 사람: ${TEAMBLE_EMAIL}`}</Text>
            <Text style={[styles.emailText, styles.marginTop8]}>
                {`보내는 사람: ${
                    currentUserInfo.email ? currentUserInfo.email : ""
                }`}
            </Text>

            {/** textarea */}
            <TextInput
                style={[styles.textArea, styles.marginTop12]}
                placeholder={
                    "문의 사항은 빠른 시일 내에 답변 드리겠습니다.\n답변은 회원 가입한 이메일로 전송됩니다."
                }
                value={content}
                onChangeText={setContent}
                multiline
            />

            {/** button */}
            <TouchableOpacity
                style={[
                    styles.button,
                    !(isLoading || isDataLoading || content === "")
                        ? styles.buttonActive
                        : styles.buttonDisabled,
                ]}
                onPress={postNewInquiry}
                disabled={isLoading || isDataLoading || content === ""}
            >
                {isLoading || isDataLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>문의하기</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    emailText: {
        textAlign: "left",
        color: "#595959",
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20,
    },
    textArea: {
        padding: 16,
        width: "100%",
        height: 160,
        borderRadius: 5,
        backgroundColor: "#F5F5F5",
        color: "#121212",
        fontSize: 16,
        textAlignVertical: "top",
    },
    button: {
        marginTop: 32,
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonActive: {
        backgroundColor: "#007bff",
    },
    buttonDisabled: {
        backgroundColor: "#aaa",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    marginTop8: {
        marginTop: 8,
    },
    marginTop12: {
        marginTop: 12,
    },
});

export default InquirySend;
