import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";
import { useAuthStore } from "@/store/authStore";

type RequestParams = {};

type Response = api.Profile;

const getProfile = async (user_id: number): Promise<Response> => {
    try {
        const response = await api.get<Response>(`profile/${user_id}/get/`);

        return response.data;
    } catch (error) {
        throw error;
    }
};

export default getProfile;
