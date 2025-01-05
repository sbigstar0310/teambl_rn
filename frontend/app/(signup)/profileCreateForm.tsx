import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import PrimeButton from "@/components/PrimeButton";
import React, { useState, useEffect } from "react";
import ScreenHeader from "@/components/common/ScreenHeader";

export default function ProfileCreateFormScreen() {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [currentDegree, setCurrentDegree] = useState("");
  const [year, setYear] = useState("");
  const [major1, setMajor1] = useState("");
  const [major2, setMajor2] = useState("");
  const [isProfileVerified, setIsProfileVerified] = useState(false);

  useEffect(() => {
    verifyProfile();
  }, [major1, major2]); // 의존성 배열 수정

  const verifyProfile = () => {
    if (
      name.length > 0 &&
      school.length > 0 &&
      currentDegree.length > 0 &&
      major1.length > 0
    ) {
      setIsProfileVerified(true);
    }
  };

  // 로그인 이동 콜백
  const handleSignUp = async () => {
    router.push("/signup");
  };

  return (
    <View style={[sharedStyles.container, sharedStyles.horizontalPadding]}>
      {/* Screen header */}
      <ScreenHeader />

      {/* Title */}
      <Text style={styles.title}>프로필 작성하기</Text>

      {/* Name */}
      <Text style={styles.semiTitle}>이름</Text>
      <TextInput
        style={styles.input}
        placeholder="이름 입력"
        placeholderTextColor="#A8A8A8"
        value={name}
        onChangeText={setName}
      ></TextInput>

      {/* School */}
      <Text style={styles.semiTitle}>학교</Text>
      <TextInput
        style={styles.input}
        placeholder="학교 입력"
        placeholderTextColor="#A8A8A8"
        value={school}
        onChangeText={setSchool}
      ></TextInput>

      {/* Current Degree */}
      <Text style={styles.semiTitle}>재학 과정</Text>
      <TextInput
        style={styles.input}
        placeholder="재학 과정 선택"
        placeholderTextColor="#A8A8A8"
        value={currentDegree}
        onChangeText={setCurrentDegree}
      ></TextInput>

      {/* Year */}
      <Text style={styles.semiTitle}>입학년도</Text>
      <TextInput
        style={styles.input}
        placeholder="입학년도 입력 (4자리)"
        placeholderTextColor="#A8A8A8"
        value={year}
        onChangeText={setYear}
      ></TextInput>

      {/* Major */}
      <Text style={styles.semiTitle}>전공</Text>
      <TextInput
        style={styles.input}
        placeholder="전공 검색"
        placeholderTextColor="#A8A8A8"
        value={major1}
        onChangeText={setMajor1}
      ></TextInput>

      {/* Button */}
      <PrimeButton
        text="완료"
        onClickCallback={handleSignUp}
        isActive={isProfileVerified}
        isLoading={false}
        styleOv={{ marginTop: 12 }}
      />
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

  // 여백 설정
  horizontalPadding32: {
    paddingHorizontal: 28,
  },
  marginTop126: {
    marginTop: 126,
  },
  marginBottom12: {
    marginBottom: 12,
  },
  marginBottom32: {
    marginBottom: 32,
  },
  marginBottom328: {
    marginBottom: 328,
  },
  marginBottom312: {
    marginBottom: 312,
  },
});
