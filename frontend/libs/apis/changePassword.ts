import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    new_password: string;
};

type Response = {
    detail?: string;
};

const changePassword = async (params: RequestParams): Promise<Response> => {
    const response = await api.patch<Response>("user/change-password/", params);
    return response.data;
};

export default changePassword;
