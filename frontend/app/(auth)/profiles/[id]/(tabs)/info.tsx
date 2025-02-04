import { useScroll } from '@/components/provider/ScrollContext';
import theme from '@/shared/styles/theme';
import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, Animated, StyleSheet } from 'react-native';

const dummyData = {
    keywords: [ '골프', 'CMF 디자인', '20대 중반', 'UI 디자인', '생성형 AI' ],
    skills : ['Adobe XD', 'Adobe Illustrator', 'Adobe Photoshop', 'Figma', 'Sketch', 'Zeplin'],
    introduction: '안녕하세요! 저는 UI/UX 디자이너로 일하고 있는 디자이너입니다.\n현재는 AI를 활용한 디자인에 관심이 많습니다.\n같이 프로젝트를 진행하고 싶으신 분은 연락주세요!\n안녕하세요! 저는 UI/UX 디자이너로 일하고 있는 디자이너입니다. 현재는 AI를 활용한 디자인에 관심이 많습니다. 같이 프로젝트를 진행하고 싶으신 분은 연락주세요!안녕하세요! 저는 UI/UX 디자이너로 일하고 있는 디자이너입니다. 현재는 AI를 활용한 디자인에 관심이 많습니다. 같이 프로젝트를 진행하고 싶으신 분은 연락주세요!안녕하세요! 저는 UI/UX 디자이너로 일하고 있는 디자이너입니다. 현재는 AI를 활용한 디자인에 관심이 많습니다. 같이 프로젝트를 진행하고 싶으신 분은 연락주세요!안녕하세요! 저는 UI/UX 디자이너로 일하고 있는 디자이너입니다. 현재는 AI를 활용한 디자인에 관심이 많습니다. 같이 프로젝트를 진행하고 싶으신 분은 연락주세요!안녕하세요! 저는 UI/UX 디자이너로 일하고 있는 디자이너입니다. 현재는 AI를 활용한 디자인에 관심이 많습니다. 같이 프로젝트를 진행하고 싶으신 분은 연락주세요!안녕하세요! 저는 UI/UX 디자이너로 일하고 있는 디자이너입니다. 현재는 AI를 활용한 디자인에 관심이 많습니다. 같이 프로젝트를 진행하고 싶으신 분은 연락주세요!'
};

const emptyData = {
    keywords: [],
    skills: [],
    introduction: null
};

const InfoBadge = ({ content }: { content: string }) => {
    return (
        <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
                {content}
            </Text>
        </View>
    );
}

interface ProfileInfo {
    keywords: string[];
    skills: string[];
    introduction: string | null;
}

const splitByNewline = (input: string): string[] => {
    return input.split("\n");
}

const OtherProfileInfoView = () => {

    const [profileInfo, setProfileInfo] = useState<ProfileInfo|null>(null);

    const fetchProfileInfo = async () => {
        setTimeout(() => {
            setProfileInfo(dummyData);
        }, 1000);
    };

    useEffect(() => {  
        fetchProfileInfo();
    }, []);

    const scrollY = useScroll() || new Animated.Value(0);

    return (
        <ScrollView
            contentContainerStyle={{ paddingVertical: 10 }}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
        >
            <View style={styles.container}>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldTitle}>
                        {"관심사"}
                    </Text>
                    <View style={styles.fieldContentContainer}>
                        {
                            (profileInfo && profileInfo['keywords'] && profileInfo['keywords'].length > 0) &&
                            profileInfo['keywords'].map((keyword: string, index: number) => (
                                <InfoBadge key={index} content={keyword} />
                            ))
                        }
                        {
                            !(profileInfo && profileInfo['keywords'] && profileInfo['keywords'].length > 0) &&
                            <Text style={styles.emptyMessage}>
                                {"등록된 관심사가 없습니다."}
                            </Text>
                        }
                    </View>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldTitle}>
                        {"스킬"}
                    </Text>
                    <View style={styles.fieldContentContainer}>
                        {
                            (profileInfo && profileInfo['skills'] && profileInfo['skills'].length > 0) &&
                            profileInfo['skills'].map((skill: string, index: number) => (
                                <InfoBadge key={index} content={skill} />
                            ))
                        }
                        {
                            !(profileInfo && profileInfo['skills'] && profileInfo['skills'].length > 0) &&
                            <Text style={styles.emptyMessage}>
                                {"등록된 스킬이 없습니다."}
                            </Text>
                        }
                    </View>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldTitle}>
                        {"소개"}
                    </Text>
                    <View style={styles.introContainer}>
                        {
                            (profileInfo && profileInfo['introduction'] && profileInfo['introduction'].length > 0) &&
                            splitByNewline(profileInfo['introduction']).map((line: string, index: number) => (
                                <Text key={index} style={styles.introLine}>
                                    {line}
                                </Text>
                            ))
                        }
                        {
                            !(profileInfo && profileInfo['introduction'] && profileInfo['introduction'].length > 0) &&
                            <Text style={styles.emptyMessage}>
                                {"등록된 소개가 없습니다."}
                            </Text>
                        }
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container : {
        flex: 1,
        minHeight: 700,
        backgroundColor: theme.colors.white,
        paddingVertical: 30,
        paddingHorizontal: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 35
    },
    fieldContainer : {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 12
    },
    fieldTitle : {
        fontSize: theme.fontSizes.body1,
        fontWeight: 600,
        color: theme.colors.black
    },
    fieldContentContainer : {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    introContainer : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 3,
        flexWrap: 'wrap'
    },
    introLine : {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        fontWeight: 400
    },
    emptyMessage : {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.achromatic01
    },
    badgeContainer : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 0,
        paddingHorizontal: 12,
        height: 33,
        borderRadius: 18,
        backgroundColor: theme.colors.background2
    },
    badgeText : {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        fontWeight: 400
    }
});

export default OtherProfileInfoView;