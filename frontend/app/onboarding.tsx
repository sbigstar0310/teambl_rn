import { Button, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import PrimeButton from "@/components/PrimeButton";
import styled from "@emotion/native";
import { SafeAreaView } from "react-native-safe-area-context";

const Slogan = styled.Text`
    color: #000;
    font-family: Pretendard;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.624px;
    margin-bottom: 32px;
`;

const SemiTitle = styled.Text`
    color: #121212;
    font-family: Pretendard;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: -0.384px;
    margin-bottom: 12px;
`;

const Description = styled.Text`
    color: #595959;
    font-family: Pretendard;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.266px;
`;

const Container = styled(SafeAreaView)`
    flex-direction: column;
    justify-content: space-between;
`;

const TopContainer = styled.View`
    padding-horizontal: 16px;
    margin-top: 126px;
`;

const ButtonContainer = styled.Pressable`
    height: 40px;
    margin-bottom: 53px;
`;

const OnBoardingScreen = () => {
    // 로그인 이동 콜백
    const handleLogin = async () => {
        router.push("/login");
    };

    return (
        <Container
            style={[sharedStyles.container, sharedStyles.horizontalPadding]}
        >
            <TopContainer>
                <Slogan>팀원 찾기의 새로운 기준, 팀블!</Slogan>

                <SemiTitle>팀블에 오신 것을 환영합니다!</SemiTitle>

                {/* Body Text */}
                <Description>
                    팀블은 지인 네트워크를 통해 신뢰할 수 있는 팀원을 찾는
                    플랫폼으로, 가입은 기존 회원의 초대 링크로만 가능합니다.
                </Description>
            </TopContainer>

            {/* Button */}
            <ButtonContainer>
                <PrimeButton
                    text="로그인 하기"
                    onClickCallback={handleLogin}
                    isActive={true}
                    isLoading={false}
                    styleOv={{ height: 40 }}
                />
            </ButtonContainer>
        </Container>
    );
};

const styles = StyleSheet.create({
    // Title 스타일
    title: {
        width: "100%",
        textAlign: "left",
        color: "#000000",
        fontFamily: "Pretendard",
        fontSize: 26,
        fontWeight: "600",
        letterSpacing: -0.38,
    },
    // Semi Title 스타일
    semiTitle: {
        width: "100%",
        textAlign: "left",
        color: "#121212",
        fontFamily: "Pretendard",
        fontSize: 16,
        fontWeight: "400",
        letterSpacing: -0.38,
    },
    // Body 텍스트 스타일
    bodyText: {
        width: "100%",
        textAlign: "left",
        color: "#595959",
        fontFamily: "Pretendard",
        fontSize: 14,
        fontWeight: "300",
        letterSpacing: -0.38,
    },
    // 여백 설정
    horizontalPadding32: {
        paddingHorizontal: 28,
    },
    marginTop126: {
        marginTop: 126,
    },
    marginBottom32: {
        marginBottom: 32,
    },
    marginBottom12: {
        marginBottom: 12,
    },
    marginBottom312: {
        marginBottom: 312,
    },
});

export default OnBoardingScreen;
