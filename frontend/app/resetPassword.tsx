import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { router } from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import { sharedStyles } from "./_layout";
import PrimeButton from "@/components/PrimeButton";
import ConfirmText from "@/components/ConfirmText";
import sendCodeEmail from "@/libs/apis/sendCodeEmail";
import changePasswordAPI from "@/libs/apis/User/changePassword";

const ResetPasswordScreen = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [userCode, setUserCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [codeIsVerified, setCodeIsVerified] = useState(false);
    const [passwordIsVerified, setPasswordIsVerified] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);  // 인증코드 확인 상태 추가
    const [isSendCodeLoading, setIsSendCodeLoading] = useState(false);
    const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false);
    const [isSendCodeSucces, setIsSendCodeSucces] = useState(false);

    useEffect(() => {
        setPasswordIsVerified(
            newPassword.length > 0 &&
                confirmPassword.length > 0 &&
                newPassword === confirmPassword
        );
    }, [newPassword, confirmPassword]);

    const sendCode = async () => {
        console.log("인증코드 전송: ", email);

        const generatedCode = Math.random().toString().slice(2, 8);
        console.log("생성된 인증코드: ", generatedCode);
        setCode(generatedCode);

        try {
            setIsSendCodeLoading(true);
            setIsSendCodeSucces(true);
            const response = await sendCodeEmail({
                email,
                code: generatedCode,
            });
            console.log("인증코드 전송 결과: ", response);
        } catch (error) {
            setIsSendCodeSucces(false);
            console.error("인증코드 전송 실패: ", error);
        } finally {
            setIsSendCodeLoading(false);
        }
    };

    const verifyCode = async () => {
        if (code === userCode) {
            setCodeIsVerified(true);
        } else {
            setCodeIsVerified(false);
        }
        setShowConfirmation(true);  // 인증코드 확인 후 확인 메시지 보이도록 설정
    };

    const resetPassword = async () => {
        if (!passwordIsVerified) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            setIsResetPasswordLoading(true);
            console.log("비밀번호 재설정 요청: ", newPassword);

            // 비밀번호 변경 API 호출
            const data = await changePasswordAPI({
                new_password: newPassword,
                email: email,
            });

            // 성공적인 응답 처리
            console.log("비밀번호 변경 성공: ", data);
            alert("비밀번호가 성공적으로 변경되었습니다.");
            router.push("/resetPasswordSuccess"); // 비밀번호 변경완료 페이지로 이동
        } catch (error) {
            // 오류 처리
            console.error("비밀번호 변경 실패: ", error);
            alert("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsResetPasswordLoading(false);
        }
    };

    // 이메일이 @kaist.ac.kr 포함되는지 체크
    const isKaistEmail = email.includes("@kaist.ac.kr");

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader title="비밀번호 재설정" />

            <ScrollView style={sharedStyles.horizontalPadding}>
                <Text style={styles.label}>학교 이메일</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.emailInput]}
                        placeholder="이메일 입력"
                        placeholderTextColor="#A8A8A8"
                        value={email}
                        onChangeText={setEmail}
                        readOnly={codeIsVerified}
                    />
                    <PrimeButton
                        text={isSendCodeSucces ? "전송 완료" : "인증코드 받기"}
                        onClickCallback={sendCode}
                        isActive={isKaistEmail && !codeIsVerified && !isSendCodeSucces}
                        isLoading={isSendCodeLoading}
                        styleOv={styles.smallButton}
                    />
                </View>

                <View style={styles.marginTop8} />
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.emailInput]}
                        placeholder="인증코드 입력"
                        placeholderTextColor="#A8A8A8"
                        value={userCode}
                        onChangeText={setUserCode}
                    />
                    <PrimeButton
                        text={codeIsVerified ? "인증 완료" : "인증코드 확인"}
                        onClickCallback={verifyCode}
                        isActive={email.length > 0 && userCode.length > 0 && !codeIsVerified && !isSendCodeLoading}
                        isLoading={false}
                        styleOv={styles.smallButton}
                    />
                </View>

                <ConfirmText
                    isVerified={codeIsVerified}
                    isActive={showConfirmation}
                    successText="인증코드가 일치합니다"
                    errorText="인증코드가 일치하지 않습니다."
                />

                <Text style={styles.label}>비밀번호</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input]}
                        placeholder="새 비밀번호 입력"
                        placeholderTextColor="#A8A8A8"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                </View>

                <View style={styles.marginTop8} />
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input]}
                        placeholder="새 비밀번호 확인"
                        placeholderTextColor="#A8A8A8"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

                <ConfirmText
                    isVerified={passwordIsVerified}
                    isActive={
                        newPassword.length > 0 && confirmPassword.length > 0
                    }
                    successText="비밀번호가 일치합니다"
                    errorText="비밀번호가 일치하지 않습니다."
                />

                <PrimeButton
                    text="재설정"
                    onClickCallback={resetPassword}
                    isActive={codeIsVerified && passwordIsVerified}
                    isLoading={isResetPasswordLoading}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#121212",
        marginBottom: 32,
    },
    smallButton: {
        width: 112,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#121212",
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: "#F5F5F5",
        borderRadius: 5,
        paddingHorizontal: 12,
    },
    emailInput: {
        marginRight: 8,
    },
    marginTop8: {
        marginTop: 8,
    },
});

export default ResetPasswordScreen;
