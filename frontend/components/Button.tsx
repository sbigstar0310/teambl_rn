import { View, Text, ViewStyle } from "react-native";
import React, { FC } from "react";
import styled from "@emotion/native";

type Props = {
    text: string;
    onClickCallback: () => Promise<void>;
    isActive: boolean;
    isLoading: boolean;
    style?: ViewStyle;
};

const TouchableContainer = styled.TouchableOpacity`
    witdh: 100%;
    background-color: #0923a9;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
`;

const Container = styled.View`
    witdh: 100%;
    background-color: #0923a9;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
`;

const ButtonText = styled.Text`
    color: #fff;
    text-align: center;
    font-family: Pretendard;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.304px;
`;

const Button: FC<Props> = ({
    text,
    onClickCallback,
    isActive,
    isLoading,
    style,
}) => {
    if (!isActive) {
        return (
            <Container style={[{ backgroundColor: "#A8A8A8" }, style]}>
                <ButtonText>{text}</ButtonText>
            </Container>
        );
    }

    return (
        <TouchableContainer
            onPress={onClickCallback}
            style={[{ backgroundColor: "#0923A9" }, style]}
        >
            <ButtonText>{text}</ButtonText>
        </TouchableContainer>
    );
};

export default Button;
