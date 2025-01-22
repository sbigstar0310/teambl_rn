import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    new_password: string;
    email?: string;
};

type Response = {
    detail?: string;
};

const fetchCurrentUserAPI = async (): Promise<{ email: string }> => {
    // 현재 로그인한 유저 정보를 가져오는 API
    const response = await api.get<{ email: string }>("user/current/");
    return response.data;
};

const changePassword = async (params: RequestParams): Promise<Response> => {
    try {
        // 현재 유저의 이메일 가져오기
        const currentUser = await fetchCurrentUserAPI();
        const { email } = currentUser;

        // 이메일을 요청 파라미터에 추가
        const updatedParams = { ...params, email };

        // 비밀번호 변경 API 호출
        const response = await api.patch<Response>("user/change-password/", updatedParams);
        return response.data;
    } catch (error) {
        console.error("Failed to change password", error);
        throw error; // 에러를 다시 던져 호출한 곳에서 처리할 수 있도록 함
    }
};

export default changePassword;
