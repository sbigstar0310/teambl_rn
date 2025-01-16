import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import { router } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import TeamblLogo from "@/assets/teambl.svg";
import PrimeButton from "@/components/PrimeButton";
import ConfirmText from "@/components/ConfirmText";
import login from "@/libs/apis/login";

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [isLoginButtonActive, setIsLoginButtonActive] = useState(false);
    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        checkLoginButtonActive();
    }, [email, password]);

    const handleLogin = async () => {
        // TODO: 로그인 API 요청
        console.log("로그인 시도: ", email, password);

        // 이메일 형식 점검
        if (!email.includes("@")) {
            setErrorText("이메일 형식이 올바르지 않습니다");
            setShowWarning(true);
            return;
        }

        const response = await login({ email, password });
        console.log("로그인 성공: ", JSON.stringify(response, null, 2));

        // 로그인 성공 시 홈 화면으로 이동
        router.push("/home");
    };

    const checkLoginButtonActive = () => {
        if (email.length > 0 && password.length > 0) {
            setIsLoginButtonActive(true);
        } else {
            setIsLoginButtonActive(false);
        }
    };

    return (
        <View
            style={[
                sharedStyles.container,
                sharedStyles.horizontalPadding,
                sharedStyles.contentCentered,
            ]}
        >
            {/* 로고 */}
            <View style={styles.logoContainer}>
                <TeamblLogo width={134} height={30} />
            </View>
            {/* 슬로건 */}
            <Text style={styles.slogan}>팀원 찾기의 새로운 기준, 팀블!</Text>
            {/* 입력 필드 */}
            <TextInput
                style={styles.input}
                placeholder="학교 이메일 입력"
                placeholderTextColor="#A8A8A8"
                value={email}
                onChangeText={setEmail}
            />
            <View style={styles.marginTop12} />
            <TextInput
                style={styles.input}
                placeholder="비밀번호 입력"
                placeholderTextColor="#A8A8A8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <ConfirmText
                isActive={showWarning}
                isVerified={!showWarning}
                errorText={errorText}
                successText=""
                containerStyle={{
                    alignItems: "flex-start", // 컨테이너 좌측 정렬
                    flexDirection: "row", // 가로 정렬 유지
                    alignSelf: "flex-start", // 부모 정렬 덮어쓰기
                }}
                textStyle={{
                    textAlign: "left", // 텍스트 좌측 정렬
                    alignSelf: "flex-start", // 부모 정렬 덮어쓰기
                }}
            />

            {/* 로그인 버튼 */}
            <PrimeButton
                text="로그인"
                onClickCallback={handleLogin}
                isActive={isLoginButtonActive}
                isLoading={false}
            />
            {/* 비밀번호 재설정 */}
            <TouchableOpacity
                style={styles.resetPassword}
                onPress={() => {
                    router.push("/resetPassword"); // 경로 이동
                }}
            >
                <Text style={styles.resetPasswordText}>비밀번호 재설정</Text>
            </TouchableOpacity>
            {/* 회원가입 */}
            <TouchableOpacity
                style={styles.resetPassword}
                onPress={() => {
                    router.push("/signup"); // 경로 이동
                }}
            >
                <Text style={[styles.resetPasswordText, { color: "#0923A9" }]}>
                    회원가입
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // 로고 컨테이너
    logoContainer: {
        alignItems: "center",
    },
    // 로고 이미지
    logoImage: {
        width: 134,
        height: 30,
        resizeMode: "contain", // 이미지 크기 조절 옵션
    },
    // 슬로건
    slogan: {
        fontSize: 14,
        color: "#595959",
        marginTop: 20,
        textAlign: "center",
        marginBottom: 59,
    },
    // 경고 문구
    warningText: {
        fontSize: 12,
        color: "#B80000",
        marginTop: 8,
        marginBottom: 14,
    },
    // 입력 필드
    input: {
        width: "100%",
        height: 40,
        backgroundColor: "#F5F5F5",
        borderRadius: 5,
        paddingHorizontal: 12,
    },
    // 로그인 버튼
    loginButton: {
        width: "100%",
        height: 40,
        backgroundColor: "#A8A8A8",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    // 비밀번호 재설정
    resetPassword: {
        marginTop: 16,
        alignSelf: "center", // 중앙 정렬 추가
    },
    resetPasswordText: {
        fontSize: 14,
        color: "#595959",
        textDecorationLine: "underline",
        textAlign: "center", // 텍스트 중앙 정렬 추가
    },
    marginTop12: {
        marginTop: 12,
    },
});

export default LoginScreen;
