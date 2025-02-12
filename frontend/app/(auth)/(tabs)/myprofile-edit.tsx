import ScreenHeader from "@/components/common/ScreenHeader";
import CustomTextInput from "@/components/CustomTextInput";
import DegreeBottomModal from "@/components/DegreeBottomModal";
import MajorInput from "@/components/MajorInput";
import PrimeButton from "@/components/PrimeButton";
import getProfile from "@/libs/apis/Profile/getProfile";
import updateProfile from "@/libs/apis/Profile/updateProfile";
import theme from "@/shared/styles/theme";
import { getCurrentUserId } from "@/shared/utils";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuthStore } from "@/store/authStore";

const MyProfileEditView = () => {
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false);

    const [isAcaDegreeModalVisible, setIsAcaDegreeModalVisible] =
        useState<boolean>(false);

    const [name, setName] = useState<string>("성이름");
    const [school, setSchool] = useState<string>("카이스트");
    const [academicDegree, setAcademicDegree] = useState<string>("학사");
    const [year, setYear] = useState<number>(2025);
    const [currentMajorList, setCurrentMajorList] = useState<string[]>([]);

    const getProfileInfo = async () => {
        // Get user from Zustand store
        const user = useAuthStore.getState().user;

        if (user) {
            console.log("User found in Zustand store:", user);
            setName(user.profile.user_name || "Unknown");
            setSchool(user.profile.school || "Unknown");
            setAcademicDegree(user.profile.current_academic_degree || "None");
            setYear(user.profile.year);
            setCurrentMajorList(
                user.profile.major1
                    ? user.profile.major2
                        ? [user.profile.major1, user.profile.major2]
                        : [user.profile.major1]
                    : []
            );
            return; // ✅ No need to fetch from API if user exists in store
        }

        try {
            console.log(
                "User not found in Zustand store. Fetching from API..."
            );
            // AuthStore에 유저 정보가 없으면 API를 통해 직접 가져옴. (이 코드는 혹시 모르니 남겨둠, 나중에 삭제 가능.)
            // Fetch user ID
            const id_string = await getCurrentUserId();
            const current_user_id = id_string ? Number(id_string) : null;

            if (!current_user_id) {
                throw new Error("User ID not found.");
            }

            // Fetch profile data
            const profile = await getProfile(current_user_id);

            setName(profile.user_name || "Unknown");
            setSchool(profile.school || "Unknown");
            setAcademicDegree(profile.current_academic_degree || "None");
            setYear(profile.year);
            setCurrentMajorList(
                profile.major2
                    ? [profile.major1, profile.major2]
                    : [profile.major1]
            );
        } catch (error) {
            console.error("Error fetching profile info:", error);
        }
    };

    /** TODO : backend */
    const saveInfo = async () => {
        try {
            setIsSaveLoading(true);

            const newProfile = {
                user_name: name,
                school: school,
                current_academic_degree: academicDegree,
                year: year,
                major1: currentMajorList[0] || "",
                major2: currentMajorList[currentMajorList.length - 1] || "",
            };

            const response = await updateProfile({
                profile: newProfile,
            });

            console.log("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSaveLoading(false);
        }
    };

    useEffect(() => {
        getProfileInfo();
    }, []);

    return (
        <View style={[styles.container]}>
            <ScreenHeader
                title="프로필 수정"
                onBack={router.navigate.bind(null, "/myprofile/info")}
            />
            <ScrollView style={styles.contentContainer}>
                {/** Name */}
                <View style={styles.fieldTitleContainer}>
                    <Text style={styles.fieldTitle}>{"이름"}</Text>
                </View>
                <CustomTextInput
                    placeholderText="이름을 입력해주세요"
                    value={name}
                    setValue={setName}
                />
                {/** School */}
                <View style={[styles.fieldTitleContainer, { marginTop: 20 }]}>
                    <Text style={styles.fieldTitle}>{"학교"}</Text>
                </View>
                <CustomTextInput
                    placeholderText="학교를 입력해주세요"
                    value={school}
                    setValue={setSchool}
                />
                {/** Academic Degree */}
                <View style={[styles.fieldTitleContainer, { marginTop: 20 }]}>
                    <Text style={styles.fieldTitle}>{"재학 과정"}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setIsAcaDegreeModalVisible(true);
                    }}
                >
                    <View style={styles.textView}>
                        <Text style={styles.textViewContent}>
                            {academicDegree}
                        </Text>
                    </View>
                </TouchableOpacity>
                <DegreeBottomModal
                    handleDegreeSelect={(degree: string) => {
                        setAcademicDegree(degree);
                    }}
                    selectedDegree={academicDegree}
                    visible={isAcaDegreeModalVisible}
                    onClose={() => setIsAcaDegreeModalVisible(false)}
                />
                {/** Year */}
                <View style={[styles.fieldTitleContainer, { marginTop: 20 }]}>
                    <Text style={styles.fieldTitle}>{"입학년도"}</Text>
                </View>
                <CustomTextInput
                    placeholderText="입학년도를 입력해주세요 (e.g. 2025)"
                    value={year}
                    setValue={setYear}
                    type="number"
                    maxLength={4}
                    onChangeHandler={(text: any) => {
                        if (text === "") {
                            setYear(-999);
                            return;
                        }
                        const numericText = text.replace(/[^0-9]/g, "");
                        setYear(parseInt(numericText));
                    }}
                />
                {/** Major */}
                <View style={[styles.fieldTitleContainer, { marginTop: 20 }]}>
                    <Text style={styles.fieldTitle}>{"전공"}</Text>
                    <Text style={styles.fieldSubTitle}>
                        {"최대 2개까지 입력 가능"}
                    </Text>
                </View>
                <MajorInput
                    selectedMajors={currentMajorList}
                    updateSelectedMajors={setCurrentMajorList}
                />
                {/** save button */}
                <PrimeButton
                    text={"저장"}
                    onClickCallback={saveInfo}
                    isActive={true}
                    isLoading={isSaveLoading}
                    styleOv={{ marginTop: 32 }}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        paddingHorizontal: 20,
        paddingVertical: 30,
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
    textView: {
        width: "100%",
        backgroundColor: theme.colors.achromatic05,
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    textViewContent: {
        fontSize: theme.fontSizes.body1,
    },
});

export default MyProfileEditView;
