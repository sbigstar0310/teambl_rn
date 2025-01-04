import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ACCESS_TOKEN, REFRESH_TOKEN} from "@/shared/constants";

const api = axios.create({
    baseURL: "http://192.168.0.16", // 수정 필요(현재는 대용 컴퓨터 ip 주소)
});

// Request Interceptor: Attach Authorization header automatically
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN); // Get token from AsyncStorage
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 errors and refresh tokens
api.interceptors.response.use(
    (response: AxiosResponse) => response, // Pass successful responses directly
    async (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            console.warn("Access token expired or unauthorized. Attempting to refresh token...");
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN); // Get refresh token

            if (refreshToken) {
                try {
                    const { data } = await axios.post(
                        "http://192.168.0.16/refresh", // 수정 필요(현재는 대용 컴퓨터 ip 주소)
                        { token: refreshToken }
                    );

                    // Save new access token
                    await AsyncStorage.setItem(ACCESS_TOKEN, data.accessToken);

                    // Retry the original request
                    const originalConfig = error.config;
                    if (originalConfig && originalConfig.headers) {
                        originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
                        return api.request(originalConfig as InternalAxiosRequestConfig);
                    }
                } catch (refreshError) {
                    console.error("Failed to refresh token:", refreshError);
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

// Handle token errors: Remove tokens and redirect to login
async function handleTokenError(): Promise<void> {
    await AsyncStorage.removeItem(ACCESS_TOKEN);
    await AsyncStorage.removeItem(REFRESH_TOKEN);
    // Replace with navigation logic if needed
    console.warn("Redirecting to login...");
}

export default api;