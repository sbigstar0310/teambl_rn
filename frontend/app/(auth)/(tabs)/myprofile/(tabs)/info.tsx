import KeywordInput from "@/components/KeywordInput";
import PrimeButton from "@/components/PrimeButton";
import { useScroll } from "@/components/provider/ScrollContext";
import SkillInput from "@/components/SkillInput";
import TextAreaInput from "@/components/TextAreaInput";
import getProfile from "@/libs/apis/Profile/getProfile";
import updateProfile from "@/libs/apis/Profile/updateProfile";
import theme from "@/shared/styles/theme";
import { getCurrentUserId } from "@/shared/utils";
import { useAuthStore } from "@/store/authStore";
import React, { useEffect, useState } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

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
        // Get user from Zustand store
        const user = useAuthStore.getState().user;

        console.log(user);
        if (user) {
            console.log("User found in Zustand store:", user);
            setCurrentKeywordList(user.profile.keywords);
            setCurrentSkillList(user.profile.skills);
            setCurrentIntroduction(user.profile.introduction);
            return; // ✅ No need to fetch from API if user exists in store
        }

        try {
            const current_user_id = await getCurrentUserId().then((id_string) =>
                Number(id_string)
            );

            if (!current_user_id) {
                throw new Error("User ID not found.");
            }

            const profile = await getProfile(current_user_id);
            console.log("Profile fetched successfully:", profile);

            setCurrentKeywordList(profile.keywords);
            setCurrentSkillList(profile.skills);
            setCurrentIntroduction(profile.introduction);
        } catch (error) {
            console.error("Error fetching profile info:", error);
        }
    };

    /** TODO : backend */
    const saveInfo = async () => {
        try {
            setIsSaveLoading(true);

            const newProfile = {
                keywords: currentKeywordist,
                skills: currentSkillList,
                introduction: currentIntroduction,
            };

            const response = await updateProfile({
                profile: newProfile,
            });

            console.log("Profile updated successfully!, response: ", response);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSaveLoading(false);
        }
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

    const scrollY = useScroll() || new Animated.Value(0);

    return (
        <ScrollView
            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 15 }}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps={"handled"}
        >
            <View style={styles.container}>
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
                    <View
                        style={[styles.fieldTitleContainer, { marginTop: 17 }]}
                    >
                        <Text style={styles.fieldTitle}>{"스킬"}</Text>
                    </View>
                    <SkillInput
                        styles={{ marginTop: 12 }}
                        selectedSkills={currentSkillList}
                        updateSelectedSkills={setCurrentSkillList}
                    />
                    <View
                        style={[styles.fieldTitleContainer, { marginTop: 17 }]}
                    >
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
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.achromatic05,
    },
    innerContainer: {
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
