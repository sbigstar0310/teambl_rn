import {
    View,
    Text,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
} from "react-native";
import React, { FC } from "react";
import styled from "@emotion/native";

type Props = {
    text: string;
    onClickCallback: () => Promise<void>;
    isActive: boolean;
    isLoading: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
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
    font-family: PretendardSemiBold;
    font-size: 16px;
    letter-spacing: -0.304px;
`;

const LoadingIndicator = styled.ActivityIndicator`
    width: 20px;
    height: 20px;
`;

const Button: FC<Props> = ({
    text,
    onClickCallback,
    isActive,
    isLoading,
    style,
    textStyle,
}) => {
    if (!isActive) {
        return (
            <Container
                style={[{ backgroundColor: "#A8A8A8", height: 40 }, style]}
            >
                {isLoading ? (
                    <LoadingIndicator color="#FFF" />
                ) : (
                    <ButtonText style={textStyle}>{text}</ButtonText>
                )}
            </Container>
        );
    }

    return (
        <TouchableContainer
            onPress={onClickCallback}
            style={[{ backgroundColor: "#0923A9", height: 40 }, style]}
        >
            {isLoading ? (
                <LoadingIndicator color="#FFF" />
            ) : (
                <ButtonText style={textStyle}>{text}</ButtonText>
            )}
        </TouchableContainer>
    );
};

export default Button;
