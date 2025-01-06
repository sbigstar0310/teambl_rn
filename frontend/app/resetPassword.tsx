import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import { sharedStyles } from "./_layout";
import PrimeButton from "@/components/PrimeButton";
import ConfirmText from "@/components/ConfirmText";

const ResetPasswordScreen = () => {
  // 상태 관리
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeIsVerified, setCodeIsVerified] = useState(false);
  const [passwordIsVerified, setPasswordIsVerified] = useState(false);

  // 비밀번호 검증
  useEffect(() => {
    setPasswordIsVerified(
      newPassword.length > 0 &&
        confirmPassword.length > 0 &&
        newPassword === confirmPassword
    );
  }, [newPassword, confirmPassword]);

  // 인증 코드 전송
  const sendCode = async () => {
    console.log("인증코드 전송: ", email);
    // API 요청 추가 예정
  };

  // 코드 검증
  const verifyCode = async () => {
    console.log("코드 확인: ", code);
    // API 요청 추가 예정
    setCodeIsVerified(true);
  };

  // 비밀번호 재설정
  const resetPassword = async () => {
    console.log("비밀번호 재설정: ", newPassword);
    // API 요청 추가 예정
    router.push("/login");
  };

  return (
    <View style={sharedStyles.container}>
      {/* 헤더 */}
      <ScreenHeader />

      <View style={sharedStyles.horizontalPadding}>
        {/* 타이틀 */}
        <Text style={styles.title}>비밀번호 재설정</Text>

        {/* 이메일 입력 */}
        <Text style={styles.label}>학교 이메일</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.emailInput]}
            placeholder="이메일 입력"
            placeholderTextColor="#A8A8A8"
            value={email}
            onChangeText={setEmail}
          />
          <PrimeButton
            text="인증코드 받기"
            onClickCallback={sendCode}
            isActive={email.length > 0}
            isLoading={false}
            styleOv={styles.smallButton}
          />
        </View>

        {/* 인증코드 입력 */}
        <View style={styles.marginTop8} />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.emailInput]}
            placeholder="인증코드 입력"
            placeholderTextColor="#A8A8A8"
            value={code}
            onChangeText={setCode}
          />
          <PrimeButton
            text="인증코드 확인"
            onClickCallback={verifyCode}
            isActive={email.length > 0 && code.length > 0}
            isLoading={false}
            styleOv={styles.smallButton}
          />
        </View>

        {/* 인증코드 확인 */}
        <ConfirmText
          isVerified={codeIsVerified}
          isActive={email.length > 0 && code.length > 0}
          successText="인증코드가 일치합니다"
          errorText="인증코드가 일치하지 않습니다."
        />

        {/* 비밀번호 입력 */}
        <Text style={styles.label}>비밀번호</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.emailInput]}
            placeholder="새 비밀번호 입력"
            placeholderTextColor="#A8A8A8"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <View style={styles.marginTop8} />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.emailInput]}
            placeholder="새 비밀번호 확인"
            placeholderTextColor="#A8A8A8"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* 비밀번호 확인 */}
        <ConfirmText
          isVerified={passwordIsVerified}
          isActive={newPassword.length > 0 && confirmPassword.length > 0}
          successText="비밀번호가 일치합니다"
          errorText="비밀번호가 일치하지 않습니다."
        />

        {/* 재설정 버튼 */}
        <PrimeButton
          text="재설정"
          onClickCallback={resetPassword}
          isActive={codeIsVerified && passwordIsVerified}
          isLoading={false}
        />
      </View>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121212",
    marginBottom: 32,
  },
  smallButton: {
    width: 112,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121212",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  emailInput: {
    marginRight: 8,
  },
  marginTop8: {
    marginTop: 8,
  },
});

export default ResetPasswordScreen;
