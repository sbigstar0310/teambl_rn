import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { router } from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import { sharedStyles } from "../_layout";
import PrimeButton from "@/components/PrimeButton";
import ConfirmText from "@/components/ConfirmText";
import sendCodeEmail from "@/libs/apis/sendCodeEmail";

const SignUpScreen = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [userCode, setUserCode] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRe, setPasswordRe] = useState("");
    const [codeIsVerified, setCodeIsVerified] = useState(false);
    const [passwordIsVerified, setPasswordIsVerified] = useState(false);

    useEffect(() => {
        verifyPassword();
    }, [password, passwordRe]); // 의존성 배열 수정

    const sendCode = async () => {
        console.log("인증코드 전송: ", email);

        // 랜덤 6자리 코드 생성
        const code = Math.random().toString().slice(2, 8);
        console.log("인증코드: ", code);
        setCode(code.toString());
        try {
            const response = await sendCodeEmail({ email, code });
            console.log("인증코드 전송 결과: ", response);
        } catch (error) {
            console.error("인증코드 전송 실패: ", error);
        }
    };

    const verifyCode = async () => {
        console.log("코드 확인: ", code, userCode);
        if (code == userCode) {
            setCodeIsVerified(true);
        } else {
            setCodeIsVerified(false);
        }
    };

    const verifyPassword = () => {
        let verified = password.length > 0 && password == passwordRe;
        setPasswordIsVerified(verified);
    };

    const goProfileCreateForm = async () => {
        if (password !== passwordRe) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 이메일과 비밀번호를 넘겨주어야 함
        router.push({
            pathname: "/profileCreateForm",
            params: { email: email, password: password },
        });
    };

    return (
        <View style={sharedStyles.container}>
            {/* Shared Header */}
            <ScreenHeader />

            <View style={sharedStyles.horizontalPadding}>
                {/* Title */}
                <Text style={styles.title}>회원가입</Text>

                {/* 이메일 입력 */}
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
                        text="인증코드 받기"
                        onClickCallback={sendCode}
                        isActive={email.length > 0 && !codeIsVerified}
                        isLoading={false}
                        styleOv={styles.smallButton}
                    ></PrimeButton>
                </View>

                {/* Margin 8 */}
                <View style={styles.marginTop8} />

                {/* 인증코드 입력 */}
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.emailInput]}
                        placeholder="인증코드 입력"
                        placeholderTextColor="#A8A8A8"
                        value={userCode}
                        onChangeText={setUserCode}
                    />
                    <PrimeButton
                        text="인증코드 확인"
                        onClickCallback={verifyCode}
                        isActive={code.length > 0}
                        isLoading={false}
                        styleOv={styles.smallButton}
                    ></PrimeButton>
                </View>

                {/* 인증코드 확인 */}
                <ConfirmText
                    isVerified={codeIsVerified}
                    isActive={
                        email.length > 0 &&
                        code.length > 0 &&
                        userCode.length > 0
                    }
                    successText="인증코드가 일치합니다"
                    errorText="인증코드가 일치하지 않습니다."
                />

                {/* 비밀번호 입력 */}
                <Text style={styles.label}>비밀번호</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.emailInput]}
                        placeholder="비밀번호 입력"
                        placeholderTextColor="#A8A8A8"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {/* Margin 8 */}
                <View style={styles.marginTop8} />

                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.emailInput]}
                        placeholder="비밀번호 확인"
                        placeholderTextColor="#A8A8A8"
                        secureTextEntry
                        value={passwordRe}
                        onChangeText={setPasswordRe}
                    />
                </View>

                {/* 비밀번호 확인 */}
                <ConfirmText
                    isVerified={passwordIsVerified}
                    isActive={password.length > 0 && passwordRe.length > 0}
                    successText="비밀번호가 일치합니다"
                    errorText="비밀번호가 일치하지 않습니다."
                />

                {/* 다음 버튼 */}
                <PrimeButton
                    text="다음"
                    onClickCallback={goProfileCreateForm}
                    isActive={codeIsVerified && passwordIsVerified}
                    isLoading={false}
                ></PrimeButton>
            </View>
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
    codeButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    resetButton: {
        marginTop: 20,
        height: 40,
        backgroundColor: "#A8A8A8",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    resetButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    confirmText: {
        fontSize: 12,
        marginTop: 4,
        marginBottom: 16,
    },
    successText: {
        color: "#42A513", // 성공 색상
    },
    errorText: {
        color: "#B80000", // 에러 색상
    },
    marginTop8: {
        marginTop: 8,
    },
});

export default SignUpScreen;
