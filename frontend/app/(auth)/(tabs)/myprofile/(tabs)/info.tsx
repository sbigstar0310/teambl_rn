import KeywordInput from "@/components/KeywordInput";
import PrimeButton from "@/components/PrimeButton";
import SkillInput from "@/components/SkillInput";
import TextAreaInput from "@/components/TextAreaInput";
import getProfile from "@/libs/apis/Profile/getProfile";
import theme from "@/shared/styles/theme";
import { getCurrentUserId } from "@/shared/utils";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const MyProfileInfoView = () => {
    const [currentKeywordist, setCurrentKeywordList] = useState([
        "관심사1",
        "관심사4",
        "관심사5",
        "긴이름을가진관심사99",
    ]);
    const [currentSkillList, setCurrentSkillList] = useState<string[]>([]);
    const [currentIntroduction, setCurrentIntroduction] = useState("");

    const [isSaveLoading, setIsSaveLoading] = useState(false);

    const getProfileInfo = async () => {
        try {
            const current_user_id = await getCurrentUserId().then((id_string) =>
                Number(id_string)
            );

            if (!current_user_id) {
                throw new Error("User ID not found.");
            }

            const profile = await getProfile(current_user_id);

            setCurrentKeywordList(profile.keywords);
            setCurrentSkillList(profile.skills);
            setCurrentIntroduction(profile.introduction);
        } catch (error) {
            console.error("Error fetching profile info:", error);
        }
    };

    /** TODO : backend */
    const saveInfo = async () => {
        setIsSaveLoading(true);
        setTimeout(() => {
            setIsSaveLoading(false);
        }, 1000);
    };

    const handleNewKeyword = (newKeyword: string) => {
        if (newKeyword.trim()) {
            setCurrentKeywordList([...currentKeywordist, newKeyword]);
        }
    };

    const handleRemoveKeyword = (index: number) => {
        setCurrentKeywordList(currentKeywordist.filter((_, i) => i !== index));
    };

    const handleNewSkill = (newSkill: any) => {
        if (newSkill.trim()) {
            setCurrentSkillList([...currentSkillList, newSkill]);
        }
    };

    const handleRemoveSkill = (index: number) => {
        setCurrentSkillList(currentSkillList.filter((_, i) => i !== index));
    };

    useEffect(() => {
        getProfileInfo();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.fieldTitleContainer}>
                    <Text style={styles.fieldTitle}>{"관심사"}</Text>
                    <Text style={styles.fieldSubTitle}>{"최대 5개"}</Text>
                </View>
                <KeywordInput
                    currentKeywordList={currentKeywordist}
                    onAdd={handleNewKeyword}
                    onRemove={handleRemoveKeyword}
                />
                <View style={[styles.fieldTitleContainer, { marginTop: 17 }]}>
                    <Text style={styles.fieldTitle}>{"스킬"}</Text>
                </View>
                <SkillInput
                    styles={{ marginTop: 12 }}
                    selectedSkills={currentSkillList}
                    updateSelectedSkills={setCurrentSkillList}
                />
                <View style={[styles.fieldTitleContainer, { marginTop: 17 }]}>
                    <Text style={styles.fieldTitle}>{"소개"}</Text>
                </View>
                <TextAreaInput
                    value={currentIntroduction}
                    setValue={setCurrentIntroduction}
                    placeholderText={
                        "관심 있는 분야, 이루고자 하는 목표, 전문성을 쌓기 위해 하고 있는 활동 등 본인을 설명하는 글을 자유롭게 작성해 보세요."
                    }
                />
                {/** save button */}
                <PrimeButton
                    text={"저장"}
                    onClickCallback={saveInfo}
                    isActive={true}
                    isLoading={isSaveLoading}
                    styleOv={{ marginTop: 32 }}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.achromatic05,
        paddingTop: 6,
    },
    innerContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        backgroundColor: theme.colors.white,
        paddingTop: 30,
        paddingBottom: 50,
        paddingHorizontal: 15,
    },
    fieldTitleContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingBottom: 12,
    },
    fieldTitle: {
        fontSize: theme.fontSizes.subtitle,
        fontWeight: 600,
        color: theme.colors.black,
        marginRight: 12,
    },
    fieldSubTitle: {
        fontSize: theme.fontSizes.body2,
        fontWeight: 400,
        color: theme.colors.achromatic01,
    },
});

export default MyProfileInfoView;
