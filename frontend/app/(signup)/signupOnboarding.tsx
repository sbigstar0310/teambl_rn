import { Button, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { sharedStyles } from "@/app/_layout";
import PrimeButton from "@/components/PrimeButton";

export default function OnBoardingScreen() {
  // 로그인 이동 콜백
  const handleSignUp = async () => {
    router.push("/signup");
  };

  return (
    <View style={[sharedStyles.container, sharedStyles.horizontalPadding]}>
      {/* Title */}
      <Text
        style={[
          styles.title,
          styles.marginBottom12,
          styles.marginTop126,
          styles.horizontalPadding32,
        ]}
      >
        팀원 찾기의 새로운 기준, 팀블!
      </Text>

      {/* Semi Title */}
      <Text
        style={[
          styles.semiTitle,
          styles.marginBottom328,
          styles.horizontalPadding32,
        ]}
      >
        지인 네트워크를 통해 최적의 팀원을 구하세요.
      </Text>

      {/* Button */}
      {/* Prime Button */}
      <PrimeButton
        text="회원가입 시작하기"
        onClickCallback={handleSignUp}
        isActive={true}
        isLoading={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Title 스타일
  title: {
    width: "100%",
    textAlign: "center",
    color: "#000000",
    fontFamily: "Pretendard",
    fontSize: 26,
    fontWeight: "600",
    letterSpacing: -0.38,
  },
  // Semi Title 스타일
  semiTitle: {
    width: "100%",
    textAlign: "center",
    color: "#121212",
    fontFamily: "Pretendard",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: -0.38,
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
