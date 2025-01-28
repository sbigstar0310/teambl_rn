import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    password: string;
};

type Response = {
    detail?: string;
    isSame?: boolean;
};

const checkPassword = async (params: RequestParams): Promise<Response> => {
    const response = await api.post<Response>("user/check-password/", params);
    return response.data;
};

export default checkPassword;
