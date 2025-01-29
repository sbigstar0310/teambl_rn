import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = {
    paths_name: string[];
    paths_id: number[];
    current_user_id: number;
    target_user_id: number;
};

const getUserPath = async (target_user_id: number): Promise<Response> => {
    const response = await api.get<Response>(`others/path/${target_user_id}/`);
    return response.data;
};

export default getUserPath;
