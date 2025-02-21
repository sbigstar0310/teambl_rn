import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { router } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import PrimeButton from "@/components/PrimeButton";
import React, { useState, useEffect } from "react";
import ScreenHeader from "@/components/common/ScreenHeader";
import DegreeBottomModal from "@/components/DegreeBottomModal";
import MajorBottomModal from "@/components/MajorBottomModal";
import MajorSearchInput from "@/components/MajorSearchInput";
import signup from "@/libs/apis/signup";
import { useLocalSearchParams } from "expo-router/build/hooks";
import Button from "@/components/Button";
import theme from "@/shared/styles/theme";
import KeywordInput from "@/components/KeywordInput";

type Params = {
    email: string;
    password: string;
};

export default function ProfileCreateFormScreen() {
    const [profile, setProfile] = useState<api.Profile>({
        user_name: "",
        school: "카이스트",
        current_academic_degree: "",
        year: 2025,
        major1: "",
        major2: null, // not required
        introduction: "",
        image: null, // not required
        keywords: [], // not required
        one_degree_count: 0, // not required
        skills: [], // not required
        portfolio_links: [], // not required
    });
    const [isProfileVerified, setIsProfileVerified] = useState(false);
    const [currentDegreeModalVisible, setCurrentDegreeModalVisible] =
        useState(false);
    const [majorModalVisible, setMajorModalVisible] = useState(false);
    const [isSignUpLoading, setIsSignUpLoading] = useState(false);

    const handleSelect = (field: keyof api.Profile, value: string | number | string[]) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const toggleModal = (modal: "degree" | "major") => {
        if (modal === "degree") {
            setCurrentDegreeModalVisible(!currentDegreeModalVisible);
        } else {
            setMajorModalVisible(!majorModalVisible);
        }
    };

    const { email, password } = useLocalSearchParams<Params>();

    useEffect(() => {
        verifyProfile();
    }, [profile]);

    const verifyProfile = () => {
        const { user_name, school, current_academic_degree, year, major1, keywords } =
            profile;
        setIsProfileVerified(
            user_name.length > 0 &&
                school.length > 0 &&
                current_academic_degree.length > 0 &&
                year > 0 &&
                major1.length > 0 &&
                keywords.length > 1
        );
    };

    const handleSignUp = async () => {
        console.log("회원가입 시도: ", email, password, profile);

        try {
            setIsSignUpLoading(true);
            const response = await signup({ email, password, profile });
            console.log("회원가입 성공: ", response);

            router.push({
                pathname: "/signupCongratulate",
                params: { user_name: profile.user_name, email: email, password: password },
            });
        } catch (error) {
            console.error("회원가입 실패: ", error);
        } finally {
            setIsSignUpLoading(false);
        }
    };

    const handleMajorSelect = (major: string) => {
        let currentMajors = [profile.major1];

        if (profile.major2) {
            currentMajors.push(profile.major2);
        }

        if (currentMajors.includes(major)) {
            // Remove the major if it's already selected
            currentMajors = currentMajors.filter((m) => m !== major);
        } else {
            // Add the new major
            currentMajors.unshift(major);

            // Ensure only two majors are selected
            if (currentMajors.length > 2) {
                currentMajors.pop(); // Remove the oldest selected major
            }
        }

        // Update the profile state
        handleSelect("major1", currentMajors[0]);
        handleSelect("major2", currentMajors[1] || "");
    };

    const handleMajorRemove = (major: string) => {
        if (profile.major1 === major) {
            if (profile.major2) {
                handleSelect("major1", profile.major2);
                handleSelect("major2", "");
            } else {
                handleSelect("major1", "");
            }
        } else if (profile.major2 === major) {
            handleSelect("major2", "");
        }
    };

    const selectedMajors = [profile.major1, profile.major2]
        .filter((major) => major !== "")
        .filter((major) => major !== null);

    const handleNewKeyword = (newKeyword: string) => {
        if (newKeyword.trim()) {
            handleSelect("keywords", [...profile.keywords, newKeyword]);
        }
    };

    const handleRemoveKeyword = (index: number) => {
        handleSelect("keywords", profile.keywords.filter((_, i) => i !== index));
    };

    return (
        <View style={sharedStyles.container}>
            {/* Screen header */}
            <ScreenHeader title={"프로필 작성하기"} />

            <View style={sharedStyles.horizontalPadding}>
                {/* Name */}
                <Text style={styles.semiTitle}>이름</Text>
                <TextInput
                    style={styles.input}
                    placeholder="이름 입력"
                    placeholderTextColor="#A8A8A8"
                    value={profile.user_name}
                    onChangeText={(text) => handleSelect("user_name", text)}
                ></TextInput>

                {/* School */}
                <Text style={styles.semiTitle}>학교</Text>
                <TextInput
                    style={styles.input}
                    placeholder="학교 입력"
                    placeholderTextColor="#A8A8A8"
                    value={profile.school}
                    defaultValue="카이스트"
                    onChangeText={(text) => handleSelect("school", text)}
                ></TextInput>

                {/* Current Degree */}
                <Text style={styles.semiTitle}>재학 과정</Text>
                <TouchableOpacity
                    onPress={() => toggleModal("degree")} // 안드로이드
                >
                    <TextInput
                        style={styles.input}
                        placeholder="재학 과정 선택"
                        placeholderTextColor="#A8A8A8"
                        value={profile.current_academic_degree}
                        editable={false} // Prevent user editing
                        onPress={() => toggleModal("degree")} // IOS
                    />
                </TouchableOpacity>

                {/* Year */}
                <Text style={styles.semiTitle}>입학년도</Text>
                <TextInput
                    style={styles.input}
                    placeholder="입학년도 입력 (4자리)"
                    placeholderTextColor="#A8A8A8"
                    value={profile.year.toString()}
                    onChangeText={(text) =>{
                        if (!text) {
                            handleSelect("year", "");
                        } else {
                            handleSelect("year", parseInt(text));
                        }
                    }}
                    keyboardType="numeric"
                ></TextInput>

                {/* Major */}
                <Text style={styles.semiTitle}>전공</Text>
                <MajorSearchInput
                    selectedMajors={selectedMajors}
                    placeholder="전공을 검색해주세요"
                    onPress={() => toggleModal("major")}
                    onRemove={handleMajorRemove}
                />

                {/* Keywords */}
                <Text style={[styles.semiTitle, {marginTop: 20}]}>관심사</Text>
                <KeywordInput
                    currentKeywordList={profile.keywords}
                    onAdd={handleNewKeyword}
                    onRemove={handleRemoveKeyword}
                    placeholderText={"2개 이상 입력"}
                />

                {/* Button */}
                <Button
                    text="완료"
                    onClickCallback={handleSignUp}
                    isActive={isProfileVerified && !isSignUpLoading}
                    isLoading={isSignUpLoading}
                    style={{ marginTop: 32 }}
                />

                {/* Current Degree BottomModal */}
                <DegreeBottomModal
                    visible={currentDegreeModalVisible}
                    onClose={() => toggleModal("degree")}
                    handleDegreeSelect={(degree: string) =>
                        handleSelect("current_academic_degree", degree)
                    }
                    selectedDegree={profile.current_academic_degree}
                    heightPercentage={0.33}
                />

                {/* Major BottomModal */}
                <MajorBottomModal
                    visible={majorModalVisible}
                    onClose={() => toggleModal("major")}
                    handleMajorSelect={handleMajorSelect}
                    selectedMajors={[
                        profile.major1,
                        profile.major2 || "",
                    ].filter((major) => major !== "")}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Title 스타일
    title: {
        width: "100%",
        height: 28,
        textAlign: "left",
        color: "#000000",
        fontFamily: "PretendardSemiBold",
        fontSize: 20,
        marginBottom: 32,
    },

    // Semi Title 스타일
    semiTitle: {
        width: "100%",
        height: 26,
        textAlign: "left",
        color: "#121212",
        fontFamily: "PretendardSemiBold",
        fontSize: 16,
        marginBottom: 4,
    },

    optionContainer: {
        flexDirection: "row",
        alignItems: "center", // 수직 중앙 정렬
        paddingVertical: 4, // 상하 여백 추가
    },

    circle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#2546F3", // 테두리 색상 설정
    },

    innerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#2546F3", // 내부 색상
    },

    optionalSemiTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#121212",
        marginLeft: 8, // 동그라미와의 간격 조절
    },

    // Body 텍스트 스타일
    bodyText: {
        width: "100%",
        textAlign: "left",
        color: "#595959",
        fontFamily: "PretendardRegular",
        fontSize: 14,
    },
    input: {
        height: 40,
        backgroundColor: "#F5F5F5",
        borderRadius: 5,
        paddingHorizontal: 12,
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
    },
    hStack: {
        flexDirection: "row", // HStack처럼 가로 방향 정렬
        alignItems: "center", // 수직 중앙 정렬
        gap: 10, // 각 요소 간 간격
    },
    vStack: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8, // 각 요소 간 간격
    },

    marginBottom32: {
        marginBottom: 32,
    },
});
