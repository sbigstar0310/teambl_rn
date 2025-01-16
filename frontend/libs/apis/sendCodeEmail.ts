import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    email: string;
    code: string;
};

type Response = {
    message?: string;
    error?: string;
};

const sendCodeEmail = async (params: RequestParams): Promise<Response> => {
    const response = await api.post<Response>("/send-code-email/", params);
    return response.data;
};

export default sendCodeEmail;
