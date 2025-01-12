import DegreeBottomModal from '@/components/DegreeBottomModal';
import KeywordInput from '@/components/KeywordInput';
import theme from '@/shared/styles/theme';
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const MyProfileInfoView = () => {

    const [currentSkillList, setCurrentSkillList] = useState(["관심사1", "관심사4", "관심사5", "긴이름을가진관심사"]);

    return (
        <ScrollView
            style={styles.container}
        >
            <View
                style={styles.innerContainer}
            >
                <View
                    style={styles.fieldTitleContainer}
                >
                    <Text
                        style={styles.fieldTitle}
                    >
                        {"관심사"}
                    </Text>
                    <Text
                        style={styles.fieldSubTitle}
                    >
                        {"최대 5개"}
                    </Text>
                </View>
                <KeywordInput
                    currentKeyworldList={currentSkillList}
                    setCurrentKeywordList={setCurrentSkillList}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: theme.colors.achromatic05,
        paddingTop: 6
    },
    innerContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        backgroundColor: theme.colors.white,
        paddingTop: 15,
        paddingBottom: 50,
        paddingHorizontal: 15
    },
    fieldTitleContainer : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingBottom: 12
    },
    fieldTitle : {
        fontSize: theme.fontSizes.subtitle,
        fontWeight: 600,
        color: theme.colors.black,
        marginRight: 12
    },
    fieldSubTitle : {
        fontSize: theme.fontSizes.body2,
        fontWeight: 400,
        color: theme.colors.achromatic01
    }
});

export default MyProfileInfoView;