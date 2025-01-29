import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = {
    distance?: number;
};

const getUserDistance = async (user_id: number): Promise<Response> => {
    try {
        const response = await api.get<Response>(
            `others/get-user-distance/${user_id}/`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default getUserDistance;
