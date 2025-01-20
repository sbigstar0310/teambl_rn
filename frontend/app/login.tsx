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
import styled from "@emotion/native";
import Button from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";

const Container = styled(SafeAreaView)`
    flex-direction: column;
    justify-content: top;
`;

const TopContainer = styled.View`
    gap: 17px;
    justify-content: center;
    margin-top: 116px;
    margin-bottom: 59px;
`;

const InputContainer = styled.View`
    gap: 8px;
`;

const ButtonContainer = styled.Pressable`
    margin-bottom: 28px;
`;

const BottomContainer = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12px;
`;

const LogoContainer = styled.View`
    align-items: center;
`;

const Slogan = styled.Text`
    font-size: 14px;
    color: #595959;
    text-align: center;
`;

const ResetPasswordText = styled.Text`
    font-size: 14px;
    color: #595959;
    text-decoration-line: underline;
    text-align: center;
    width: 107px;
`;

const SignupText = styled.Text`
    font-size: 14px;
    color: #595959;
    text-decoration-line: underline;
    text-align: center;
    width: 107px;
`;

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
        <Container
            style={[sharedStyles.container, sharedStyles.horizontalPadding]}
        >
            <TopContainer>
                <LogoContainer>
                    <TeamblLogo width={134} height={30} />
                </LogoContainer>

                <Slogan>팀원 찾기의 새로운 기준, 팀블!</Slogan>
            </TopContainer>

            <InputContainer>
                <TextInput
                    style={styles.input}
                    placeholder="학교 이메일 입력"
                    placeholderTextColor="#A8A8A8"
                    value={email}
                    onChangeText={setEmail}
                />
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
            </InputContainer>

            <ButtonContainer>
                <Button
                    text="로그인"
                    onClickCallback={handleLogin}
                    isActive={isLoginButtonActive}
                    isLoading={false}
                    style={{ height: 40 }}
                />
            </ButtonContainer>

            <BottomContainer>
                <ResetPasswordText
                    onPress={() => {
                        router.push("/resetPassword"); // 경로 이동
                    }}
                >
                    비밀번호 재설정
                </ResetPasswordText>
                <Text> | </Text>
                <SignupText
                    onPress={() => {
                        router.push("/signup"); // 경로 이동
                    }}
                >
                    회원가입
                </SignupText>
            </BottomContainer>
        </Container>
    );
};

const styles = StyleSheet.create({
    // 입력 필드
    input: {
        width: "100%",
        height: 40,
        backgroundColor: "#F5F5F5",
        borderRadius: 5,
        paddingHorizontal: 12,
    },
});

export default LoginScreen;
