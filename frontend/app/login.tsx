import { React, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import TeamblLogo from "@/assets/teambl.svg";
import PrimeButton from "@/components/PrimeButton";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isLoginButtonActive, setIsLoginButtonActive] = useState(false);
  const handleLogin = async () => {
    router.push("/login");
  };

  const checkPasswordCorrect = async (password: String) => {
    if (email.length > 0 && password.length > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  return (
    <View
      style={[
        sharedStyles.container,
        sharedStyles.horizontalPadding,
        sharedStyles.contentCentered,
      ]}
    >
      {/* 로고 */}
      <View style={styles.logoContainer}>
        <TeamblLogo width={134} height={30} />
      </View>

      {/* 슬로건 */}
      <Text style={styles.slogan}>팀원 찾기의 새로운 기준, 팀블!</Text>

      {/* 입력 필드 */}
      <TextInput
        style={styles.input}
        placeholder="학교 이메일 입력"
        placeholderTextColor="#A8A8A8"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 입력"
        placeholderTextColor="#A8A8A8"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          checkPasswordCorrect(text); // 최신 입력 값을 전달
        }}
      />

      {/* Warnning Text*/}
      <Text style={styles.warningText}>
        {showWarning ? "이메일 또는 비밀번호가 일치하지 않습니다" : ""}
      </Text>

      {/* 로그인 버튼 */}
      <PrimeButton
        text="로그인"
        onClickCallback={handleLogin}
        isActive={false}
        isLoading={false}
      />

      {/* 비밀번호 재설정 */}
      <TouchableOpacity style={styles.resetPassword}>
        <Text style={styles.resetPasswordText}>비밀번호 재설정</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // 로고 컨테이너
  logoContainer: {
    alignItems: "center",
  },
  // 로고 이미지
  logoImage: {
    width: 134,
    height: 30,
    resizeMode: "contain", // 이미지 크기 조절 옵션
  },
  // 슬로건
  slogan: {
    fontSize: 14,
    color: "#595959",
    marginTop: 20,
    textAlign: "center",
    marginBottom: 59,
  },
  // 경고 문구
  warningText: {
    fontSize: 12,
    color: "#B80000",
    marginTop: 8,
    marginBottom: 14,
  },
  // 입력 필드
  input: {
    width: "100%",
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    paddingHorizontal: 12,
    marginTop: 20,
  },
  // 로그인 버튼
  loginButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#A8A8A8",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // 비밀번호 재설정
  resetPassword: {
    marginTop: 16,
    alignSelf: "center", // 중앙 정렬 추가
  },
  resetPasswordText: {
    fontSize: 14,
    color: "#595959",
    textDecorationLine: "underline",
    textAlign: "center", // 텍스트 중앙 정렬 추가
  },
});

export default LoginScreen;
