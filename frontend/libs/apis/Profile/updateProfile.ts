import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = Partial<api.Profile>;

type Response = api.Profile;

const updateProfile = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.put<Response>(
            "profile/current/update/",
            params
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default updateProfile;
