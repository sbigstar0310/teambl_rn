import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import { sharedStyles } from "./_layout";

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendCode = () => {
    console.log("인증코드 전송: ", email);
    // API 요청 추가 예정
  };

  const verifyCode = () => {
    console.log("코드 확인: ", code);
    // API 요청 추가 예정
  };

  const resetPassword = () => {
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    console.log("비밀번호 재설정: ", newPassword);
    // API 요청 추가 예정
    router.push("/login");
  };

  return (
    <View style={[sharedStyles.container, sharedStyles.horizontalPadding]}>
      {/* Shared Header */}
      <ScreenHeader title={"비밀번호 재설정"} />

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
        <TouchableOpacity style={styles.codeButton} onPress={sendCode}>
          <Text style={styles.codeButtonText}>인증코드 받기</Text>
        </TouchableOpacity>
      </View>

      {/* 인증코드 입력 */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.emailInput]}
          placeholder="인증코드 입력"
          placeholderTextColor="#A8A8A8"
          value={code}
          onChangeText={setCode}
        />
        <TouchableOpacity style={styles.codeButton} onPress={verifyCode}>
          <Text style={styles.codeButtonText}>인증코드 확인</Text>
        </TouchableOpacity>
      </View>

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

      {/* 재설정 버튼 */}
      <TouchableOpacity style={styles.resetButton} onPress={resetPassword}>
        <Text style={styles.resetButtonText}>재설정</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121212",
    marginBottom: 20,
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
    marginBottom: 20,
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
  codeButton: {
    height: 40,
    paddingHorizontal: 13,
    backgroundColor: "#A8A8A8",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  codeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    marginTop: 20,
    height: 40,
    backgroundColor: "#A8A8A8",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ResetPasswordScreen;
