import { router } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import PrimeButton from "@/components/PrimeButton";
import styled from "@emotion/native";
import { SafeAreaView } from "react-native-safe-area-context";

const Slogan = styled.Text`
    color: #000;
    font-family: PretendardSemiBold;
    font-size: 26px;
    margin-bottom: 10px;
`;

const SemiTitle = styled.Text`
    color: #121212;
    font-family: PretendardRegular;
    font-size: 15px;
    margin-bottom: 10px;
`;

const Description = styled.Text`
    color: #595959;
    font-family: PretendardRegular;
    font-size: 13px;
`;

const Container = styled(SafeAreaView)`
    flex-direction: column;
    justify-content: space-between;
`;

const TopContainer = styled.View`
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
                <Slogan>
                    신뢰 기반의{"\n"}
                    프로젝트 네트워크, 팀블!
                </Slogan>

                <SemiTitle>
                    진행 중인 다양한 프로젝트를 살펴보고,{"\n"}
                    관심있는 프로젝트를 응원하며 소통을 시작해보세요!
                </SemiTitle>

                {/* Body Text */}
                <Description>
                    문의하기: info@teambl.net
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

export default OnBoardingScreen;
