import { StyleSheet, Text } from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import PrimeButton from "@/components/PrimeButton";
import Button from "@/components/Button";
import styled from "@emotion/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

type Params = {
    user_name: string;
    email: string;
    password: string;
};

const Container = styled(SafeAreaView)`
    padding-horizontal: 32px;
`;

const Name = styled.Text`
    color: #0923a9;
    font-family: PretendardSemiBold;
    font-size: 26px;
    text-align: left;
    border-width: 1px;
    width: 100%;
`;
const Title = styled.Text`
    color: #000000;
    font-family: PretendardSemiBold;
    font-size: 26px;
    text-align: left;
    width: 100%;
`;

const SemiTitle = styled.Text`
    color: #121212;
    font-family: PretendardRegular;
    font-size: 16px;
    margin-top: 32px;
    text-align: left;
    width: 100%;
`;

const LoadingIndicator = styled.ActivityIndicator`
    width: 20px;
    height: 20px;
`;

// 화면 컴포넌트
const SignUpCongradulateScreen = () => {
    const { user_name, email, password } = useLocalSearchParams<Params>();
    const [isLoading, setIsLoading] = useState(false);

    // 홈 이동 콜백
    const goHome = async () => {
        router.push("/home");
    };

    const handleLogin = async () => {
        setIsLoading(true);
        console.log("로그인 시도: ", email, password);

        try {
            // ✅ 로그인 성공 여부 확인 (true/false 반환)
            const _ = await useAuthStore.getState().login(email, password);
            console.log("✅ 로그인 성공!");
            router.push("/home"); // ✅ 로그인 성공 시에만 이동
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
            router.push("/myprofile/info");
        }
    };


    return (
        <Container
            style={[sharedStyles.container, sharedStyles.contentCentered]}
        >
            {/* Title */}
            <Title>
                <Name>{user_name}</Name>님,
            </Title>
            <Title>가입을 축하합니다!</Title>

            {/* Semi Title */}
            <SemiTitle>이제 팀블과 함께 다양한 프로젝트를 탐색해 보세요!</SemiTitle>

            {/* Additional Profile */}
            <Text
                style={styles.addProfileText}
                onPress={handleLogin}
            >
                {isLoading ? (
                    <LoadingIndicator color="#000" />
                ) : (
                    "프로필 추가로 작성하기"
                )}
            </Text>

            {/* Button */}
            <Button
                text="팀블 시작하기"
                onClickCallback={goHome}
                isActive={true}
                isLoading={false}
                style={{ width: "100%" }}
            />
        </Container>
    );
};

const styles = StyleSheet.create({
    // Additional Profile Text
    addProfileText: {
        width: "100%",
        height: 40,
        textAlign: "center",
        color: "#121212",
        fontFamily: "Pretendard",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: -0.38,
        marginTop: 236,
    },
});

export default SignUpCongradulateScreen;
