import React from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const POLICY_LINKS = {
    PRIVACY: "https://grateful-steel-1e5.notion.site/Personal-Information-Terms-da10ebf1ada6470780d6ba9ab260916b",
    SERVICE: "https://grateful-steel-1e5.notion.site/Service-Terms-and-Condition-5379c333ce1543c895dc0cebe39f4844"
};

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
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.linkContainer}
                onPress={() => openLink(POLICY_LINKS.PRIVACY)}
            >
                <Text style={styles.linkText}>{"팀블 개인정보 방침"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.linkContainer, styles.marginTop8]}
                onPress={() => openLink(POLICY_LINKS.SERVICE)}
            >
                <Text style={styles.linkText}>{"팀블 서비스 약관"}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 12,
    },
    linkContainer: {
        width: '100%',
        textAlign: 'left',
    },
    linkText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: '400',
        textDecorationLine: 'underline',
    },
    marginTop8: {
        marginTop: 8,
    },
});

export default PolicyView;