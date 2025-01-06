import {
  Button,
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
import BottomModal from "@/components/BottomModal";

export default function ProfileCreateFormScreen() {
  const [profile, setProfile] = useState<api.Profile>({
    user_name: "",
    school: "",
    current_academic_degree: "",
    year: 2024,
    major1: "",
    major2: "",
    introduction: "",
    image: "",
    keywords: [],
  });
  const [isProfileVerified, setIsProfileVerified] = useState(false);
  const [currentDegreeModalVisible, setCurrentDegreeModalVisible] =
    useState(false);
  const [majorModalVisible, setMajorModalVisible] = useState(false);

  const handleSelect = (field: keyof api.Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleModal = (modal: "degree" | "major") => {
    if (modal === "degree") {
      setCurrentDegreeModalVisible(!currentDegreeModalVisible);
    } else {
      setMajorModalVisible(!majorModalVisible);
    }
  };

  useEffect(() => {
    verifyProfile();
  }, [profile]);

  const verifyProfile = () => {
    const { user_name, school, current_academic_degree, major1 } = profile;
    setIsProfileVerified(
      user_name.length > 0 &&
        school.length > 0 &&
        current_academic_degree.length > 0 &&
        major1.length > 0
    );
  };

  const handleCreateProfile = async () => {
    router.push({
      pathname: "/signupCongratulate",
      params: { profile: JSON.stringify(profile) },
    });
  };

  return (
    <View style={sharedStyles.container}>
      {/* Screen header */}
      <ScreenHeader />

      <View style={sharedStyles.horizontalPadding}>
        {/* Title */}
        <Text style={styles.title}>프로필 작성하기</Text>

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
          onChangeText={(text) => handleSelect("school", text)}
        ></TextInput>

        {/* Current Degree */}
        <Text style={styles.semiTitle}>재학 과정</Text>
        <TextInput
          style={styles.input}
          placeholder="재학 과정 선택"
          placeholderTextColor="#A8A8A8"
          value={profile.current_academic_degree}
          onPress={() => toggleModal("degree")}
          readOnly={true}
        ></TextInput>

        {/* Year */}
        <Text style={styles.semiTitle}>입학년도</Text>
        <TextInput
          style={styles.input}
          placeholder="입학년도 입력 (4자리)"
          placeholderTextColor="#A8A8A8"
          value={profile.year.toString()}
          onChangeText={(text) => handleSelect("year", text)}
          keyboardType="numeric"
        ></TextInput>

        {/* Major */}
        <Text style={styles.semiTitle}>전공</Text>
        <TextInput
          style={styles.input}
          placeholder="전공 검색"
          placeholderTextColor="#A8A8A8"
          value={profile.major1}
          onPress={() => toggleModal("major")}
          readOnly={true}
        ></TextInput>

        {/* Button */}
        <PrimeButton
          text="완료"
          onClickCallback={handleCreateProfile}
          isActive={isProfileVerified}
          isLoading={false}
          styleOv={{ marginTop: 12 }}
        />

        {/* Current Degree BottomModal */}
        <BottomModal
          visible={currentDegreeModalVisible}
          onClose={() => toggleModal("degree")}
          heightPercentage={0.3} // 모달 높이 비율
          body={
            <View>
              {/* 제목과 설명 */}
              <View style={[styles.hStack, styles.marginBottom32]}>
                <Text
                  style={{
                    fontFamily: "pretendard",
                    fontSize: 18,
                    fontWeight: "medium",
                    letterSpacing: -0.38,
                    marginRight: 16,
                  }}
                >
                  재학 과정
                </Text>
                <Text
                  style={{
                    fontFamily: "pretendard",
                    fontSize: 12,
                    fontWeight: "regular",
                    letterSpacing: -0.38,
                  }}
                >
                  현재 재학 중인 과정을 선택해 주세요.
                </Text>
              </View>

              {/* 선택 옵션 */}
              <View style={styles.vStack}>
                {["학사", "석사", "박사"].map((option) => (
                  <View key={option} style={styles.optionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.circle,
                        {
                          borderColor:
                            profile["current_academic_degree"] === option
                              ? "#A8A8A8"
                              : "#E0E0E0",
                          backgroundColor:
                            profile["current_academic_degree"] === option
                              ? "#4CAF50"
                              : "transparent",
                        },
                      ]}
                      onPress={() =>
                        handleSelect("current_academic_degree", option)
                      }
                    >
                      {profile["current_academic_degree"] === option && (
                        <View style={styles.innerCircle} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.optionalSemiTitle}>{option}</Text>
                  </View>
                ))}
              </View>
            </View>
          }
        />

        {/* Major BottomModal */}
        <BottomModal
          visible={majorModalVisible}
          onClose={() => toggleModal("major")}
          heightPercentage={0.3}
          body={
            <View>
              <Text style={styles.semiTitle}>전공 선택</Text>
              <View style={styles.vStack}>
                {["전산학부", "전자공학과", "생명공학과"].map((option) => (
                  <View key={option} style={styles.optionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.circle,
                        {
                          borderColor:
                            profile["major1"] === option
                              ? "#A8A8A8"
                              : "#E0E0E0",
                          backgroundColor:
                            profile["major1"] === option
                              ? "#4CAF50"
                              : "transparent",
                        },
                      ]}
                      onPress={() => handleSelect("major1", option)}
                    >
                      {profile["major1"] === option && (
                        <View style={styles.innerCircle} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.optionalSemiTitle}>{option}</Text>
                  </View>
                ))}
              </View>
            </View>
          }
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
    fontFamily: "Pretendard",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.38,
    marginBottom: 32,
  },

  // Semi Title 스타일
  semiTitle: {
    width: "100%",
    height: 26,
    textAlign: "left",
    color: "#121212",
    fontFamily: "Pretendard",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.38,
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
    fontFamily: "Pretendard",
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: -0.38,
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
