import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import PrimeButton from "@/components/PrimeButton";
import Button from "@/components/Button";
import styled from "@emotion/native";
import { SafeAreaView } from "react-native-safe-area-context";

type Params = {
    user_name: string;
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

const BodyText = styled.Text`
    color: #595959;
    font-family: PretendardRegular;
    font-size: 14px;
    font-style: normal;
    margin-top: 12px;
    text-align: left;
    width: 100%;
`;

// 화면 컴포넌트
const SignUpCongradulateScreen = () => {
    const { user_name } = useLocalSearchParams<Params>();

    // 홈 이동 콜백
    const goHome = async () => {
        router.push("/home");
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
                onPress={() => router.push("/profileCreateForm")}
            >
                프로필 추가로 작성하기
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
