import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACCESS_TOKEN, USER_ID } from "@/shared/constants";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/authStore";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // 로그인 상태 추가
    const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 추가

    // 로그인 상태 확인 함수
    const checkLoginStatus = async () => {
        try {
            // AsyncStorage에서 ACCESS_TOKEN, USER_ID 가져오기
            const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN);
            const current_user_id = await AsyncStorage.getItem(USER_ID);

            // ACCESS_TOKEN이 있으면 로그인 상태로 간주
            setIsLoggedIn(!!accessToken);

            // AuthStore에 로그인 상태 저장
            useAuthStore.setState({ isLoggedIn: !!accessToken });

            // AuthStore에 유저 정보 저장
            const user = await getUserInfo(Number(current_user_id));
            useAuthStore.setState({ user });
        } catch (error) {
            console.error("Failed to check login status:", error);
            setIsLoggedIn(false); // 에러 발생 시 비로그인 처리
            AsyncStorage.clear(); // AsyncStorage 초기화
            useAuthStore.getState().logout(); // AuthStore 초기화
        } finally {
            setLoading(false); // 로딩 상태 완료
            SplashScreen.hideAsync();
        }
    };

    useEffect(() => {
        checkLoginStatus(); // 컴포넌트가 처음 렌더링될 때 실행
    }, []);

    // 로그인 상태를 아직 확인 중일 때 로딩 화면 표시
    if (loading) {
        // 로딩 화면 표시
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2546F3" />
            </View>
        );
    }

    // 로그인 상태에 따라 리다이렉트
    return <Redirect href={isLoggedIn ? "/home" : "/onboarding"} />;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
