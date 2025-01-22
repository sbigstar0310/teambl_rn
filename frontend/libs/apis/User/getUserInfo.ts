import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.User;

const getUserInfo = async (user_id: number): Promise<Response> => {
    try {
        const response = await api.get<Response>(`user/${user_id}/get/`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
        throw error;
    }
};

export default getUserInfo;
