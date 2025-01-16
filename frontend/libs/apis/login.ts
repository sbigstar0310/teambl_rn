import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    email: string;
    password: string;
};

type Response = {
    access: string;
    refresh: string;
    userId: number;
};

const login = async (params: RequestParams): Promise<Response> => {
    const response = await api.post<Response>("/token/", params);

    // save tokens and user_id to AsyncStorage
    AsyncStorage.setItem(ACCESS_TOKEN, response.data.access);
    AsyncStorage.setItem(REFRESH_TOKEN, response.data.refresh);
    AsyncStorage.setItem(USER_ID, response.data.userId.toString());

    return response.data;
};

export default login;
