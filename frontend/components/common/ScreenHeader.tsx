import {
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FC } from "react";
import { router } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import LeftArrowIcon from "@/assets/left-arrow.svg";
import styled from "@emotion/native";
interface ScreenHeaderProps {
    title?: string | FC;
    actionButton?: FC;
    onBack?(): void;
    style?: ViewStyle;
}

const Container = styled(SafeAreaView)`
    // flex: 1;
    width: 100%;
    flex-direction: row;
    padding: 16px;
    gap: 16px;
    align-items: center;
    background-color: #fff;
    // justify-content: center;
`;

const ExtraContainer = styled.View`
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    // border-width: 1px;
`;

const BtnContainer = styled(TouchableOpacity)`
    // border-width: 1px;
`;

const LeftBtn = styled(LeftArrowIcon)`
    width: 20px;
    height: 16px;
    // border-width: 1px;
`;

const Title = styled.Text`
    font-size: 20px;
    font-family: PretendardSemiBold;
    font-weight: normal;
    text-align: center;
    text-align-vertical: center;
    // border-width: 1px;
`;

export default function ScreenHeader(props: ScreenHeaderProps) {
    const handleBackButton = () => {
        if (props.onBack) props.onBack();
        else router.back();
    };

    return (
        <Container style={[props.style]}>
            {/* Backward button */}
            <BtnContainer onPress={handleBackButton}>
                <LeftBtn />
            </BtnContainer>

            {/* Optionally provided extra details */}
            {/* e.g. Screen title */}
            <ExtraContainer>
                {props.title &&
                    (typeof props.title === "string" ? (
                        <Title>{props.title}</Title>
                    ) : (
                        <props.title />
                    ))}
                {props.actionButton && <props.actionButton />}
            </ExtraContainer>
        </Container>
    );
}
