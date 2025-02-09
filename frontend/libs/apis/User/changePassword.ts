import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    new_password: string;
    email?: string;
};

type Response = {
    detail?: string;
};

const changePassword = async (params: RequestParams): Promise<Response> => {
    try {
        // 비밀번호 변경 API 호출
        const response = await api.patch<Response>(
            "user/change-password/",
            params
        );
        return response.data;
    } catch (error) {
        console.error("Failed to change password", error);
        throw error; // 에러를 다시 던져 호출한 곳에서 처리할 수 있도록 함
    }
};

export default changePassword;
