import axios, {
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    AxiosHeaders,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

// const BASE_URL = Constants.expoConfig?.extra?.API_URL || "https://default-api-url.com";
// const BASE_URL = "https://teambl.net/api/"; // for production
// const BASE_URL = "https://teambl-distribution-qm4c.onrender.com/api/"; // for development ( or QA)
const BASE_URL = "http://localhost:8000/api/"; // for ios simulator (local test)
// const BASE_URL = "http://10.0.2.2:8000/api/"; // for android emulator (local test)
// const BASE_URL = "http://192.168.97.85:8000/api/";

// API 응답 시간 Threshold (ms)
const RESPONSE_TIME_THRESHOLD = 2000;

const api = axios.create({
    baseURL: BASE_URL,
});

// 요청 인터셉터 (헤더에 Content-Type 자동 추가)
api.interceptors.request.use(
    async (config) => {
        if (!config.headers) {
            config.headers = new AxiosHeaders();
        }
        if (!config.headers.get("Content-Type")) {
            config.headers.set("Content-Type", "application/json");
        }

        // 요청 시작 시간 기록
        (config as any).metadata = { startTime: new Date().getTime() };

        return config;
    },
    (error) => Promise.reject(error)
);

// 요청 인터셉터 (헤더에 Authorization 자동 추가)
api.interceptors.request.use(
    async (
        config: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN);
            if (token) {
                if (!config.headers) {
                    config.headers = new AxiosHeaders(); // headers 초기화
                }
                config.headers.set("Authorization", `Bearer ${token}`);
            }
        } catch (error) {
            console.error("Error getting access token:", error);
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// 응답 지연 시간 계산 및 로깅
api.interceptors.response.use((response: AxiosResponse) => {
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
        const duration = new Date().getTime() - startTime;
        const threshold = RESPONSE_TIME_THRESHOLD;

        if (duration > threshold) {
            const fullUrl = `${response.config.baseURL}${response.config.url}`;

            console.warn(`⚠️ API 응답 지연 감지: ${fullUrl} (${duration}ms)`);
        }
    }

    return response;
});

// 응답 인터셉터 (401 처리 및 토큰 갱신)
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.warn("Access token expired. Attempting to refresh...");
            try {
                const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN);
                if (refreshToken) {
                    const { data }: AxiosResponse<{ accessToken: string }> =
                        await axios.post(`${BASE_URL}refresh`, {
                            token: refreshToken,
                        });

                    await AsyncStorage.setItem(ACCESS_TOKEN, data.accessToken);

                    if (error.config) {
                        if (!error.config.headers) {
                            error.config.headers = new AxiosHeaders();
                        }
                        error.config.headers.set(
                            "Authorization",
                            `Bearer ${data.accessToken}`
                        );

                        // error.config가 존재할 때만 요청 재시도
                        return api.request(error.config);
                    }
                } else {
                    console.error("No refresh token available.");
                    handleTokenError();
                }
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                handleTokenError();
            }
        }
        return Promise.reject(error);
    }
);

// 토큰 에러 처리 (로그아웃)
async function handleTokenError(): Promise<void> {
    await AsyncStorage.removeItem(ACCESS_TOKEN);
    await AsyncStorage.removeItem(REFRESH_TOKEN);
    console.log("Redirecting to login...");
}

export default api;
