import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router";

export default function Logout() {
    const router = useRouter();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        // 네비게이션이 초기화되었는지 확인
        if (!navigationState?.key) return;

        localStorage.clear(); // 저장된 토큰 정보 제거
        router.replace("/login"); // 로그인 페이지로 리디렉션
    }, [navigationState?.key]);

    return null; // 아무것도 렌더링하지 않음
}
