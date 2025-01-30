import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "@emotion/native";
import Button from "@/components/Button";
import { router } from "expo-router";
import CheckCircleIcon from "@/assets/check-circle.svg";
import { sharedStyles } from "./_layout";

const Container = styled(SafeAreaView)`
    flex: 1;
    flex-direction: column;
    justify-content: center;
    background-color: #fff;
    padding-horizontal: 20px;
`;

const TextAndButtonContainer = styled.View`
    gap: 213px;
`;

const TextContainer = styled.View`
    flex-direction: column;
    gap: 14px;
`;

const ButtonContainer = styled.Pressable`
    height: 40px;
`;

const CheckCircle = styled(CheckCircleIcon)`
    width: 80px;
    height: 80px;
    margin-bottom: 32px;
    align-self: center;
`;

const Title = styled.Text`
    color: #000;
    font-family: Pretendard;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.576px;
    text-align: center;
`;

const SemiTitle = styled.Text`
    color: #121212;
    font-family: Pretendard;
    font-size: 16px;
    font-weight: 400;
    text-align: center;
`;

const resetPasswordSuccess = () => {
    const goLogin = async () => {
        router.push("/login");
    };

    return (
        <Container>
            <CheckCircle />

            <TextAndButtonContainer>
                <TextContainer>
                    <Title>비밀번호가 다시 설정되었습니다.</Title>
                    <SemiTitle>
                        새로운 비밀번호로 다시 로그인 해 주세요.
                    </SemiTitle>
                </TextContainer>

                <ButtonContainer>
                    <Button
                        text={"로그인"}
                        onClickCallback={goLogin}
                        isActive={true}
                        isLoading={false}
                    />
                </ButtonContainer>
            </TextAndButtonContainer>
        </Container>
    );
};

export default resetPasswordSuccess;
