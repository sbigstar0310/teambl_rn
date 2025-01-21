import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    email: string;
    password: string;
    profile: api.Profile;
};

type Response = {
    id: number;
    email: string;
    last_login: string | null;
    is_superuser: boolean;
    is_staff: boolean;
    is_active: boolean;
    date_joined: string;
    profile: api.Profile;
    user_name: string;
};

const signup = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.post<Response>(
            "user/register-alone/",
            params
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default signup;
