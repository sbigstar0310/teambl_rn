import styled from "@emotion/native";
import React from "react";
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const POLICY_LINKS = {
    PRIVACY:
        "https://grateful-steel-1e5.notion.site/Personal-Information-Terms-da10ebf1ada6470780d6ba9ab260916b",
    SERVICE:
        "https://grateful-steel-1e5.notion.site/Service-Terms-and-Condition-5379c333ce1543c895dc0cebe39f4844",
};

const Container = styled.View`
    flex: 1;
    flex-direction: column;
    gap: 20px;
    justify-content: center;
    align-items: flex-start;
`;

const LinkText = styled.Text`
    color: #121212;
    font-family: Pretendard;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: -0.304px;
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-decoration-skip-ink: none;
    text-decoration-thickness: auto;
    text-underline-offset: auto;
    text-underline-position: from-font;
`;

const PolicyView: React.FC = () => {
    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            console.error(`Unable to open link: ${url}`);
        }
    };

    return (
        <Container>
            <TouchableOpacity onPress={() => openLink(POLICY_LINKS.PRIVACY)}>
                <LinkText>{"팀블 개인정보 방침"}</LinkText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openLink(POLICY_LINKS.SERVICE)}>
                <LinkText>{"팀블 서비스 약관"}</LinkText>
            </TouchableOpacity>
        </Container>
    );
};

export default PolicyView;
