// interceptor: request를 intercept해서 올바른 header를 적용해줘서 매번 반복적으로 쓸 필요 없게 해줌
// axios interceptor 사용

import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL // baseURL은 specify하지 않아도 되게 해줌
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) { // adding authorization headers automatically
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: 401 에러 처리 및 토큰 갱신
api.interceptors.response.use(
    (response) => response, // 성공적인 응답은 그대로 반환
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Access token expired or unauthorized. Attempting to refresh token...");
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);

            if (refreshToken) {
                try {
                    // 리프레시 토큰을 사용해 새 액세스 토큰 요청
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_URL}/refresh`,
                        { token: refreshToken }
                    );

                    // 새 토큰 저장
                    localStorage.setItem(ACCESS_TOKEN, data.accessToken);

                    // 원래 요청 재시도
                    error.config.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api.request(error.config);
                } catch (refreshError) {
                    console.error("Failed to refresh token:", refreshError);
                    // 리프레시 실패 시 로그인 페이지로 리다이렉트
                    handleTokenError();
                }
            } else {
                console.error("No refresh token available. Redirecting to login.");
                handleTokenError();
            }
        }

        return Promise.reject(error);
    }
);

function handleTokenError() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    window.location.href = "/login"; // 로그인 페이지로 리다이렉트
}

export default api