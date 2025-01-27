import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACCESS_TOKEN } from "@/shared/constants";
import { ActivityIndicator, View, StyleSheet } from "react-native";

export default function IndexScreen() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // 로그인 상태 추가
    const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 추가

    // 로그인 상태 확인 함수
    const checkLoginStatus = async () => {
        try {
            // AsyncStorage에서 ACCESS_TOKEN 가져오기
            const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN);
            // ACCESS_TOKEN이 있으면 로그인 상태로 간주
            setIsLoggedIn(!!accessToken);
        } catch (error) {
            console.error("Failed to check login status:", error);
            setIsLoggedIn(false); // 에러 발생 시 비로그인 처리
        } finally {
            setLoading(false); // 로딩 상태 완료
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