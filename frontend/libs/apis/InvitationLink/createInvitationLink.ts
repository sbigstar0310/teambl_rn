import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    name: string; // 초대할 사람의 이름
};

type Response = api.InvitationLink;

const createInvitationLink = async (
    params: RequestParams
): Promise<Response> => {
    try {
        const response = await api.post<Response>(
            "invitation-link/create/",
            params
        );
        return response.data;
    } catch (error) {
        console.error("Error in Creating Invitation Link", error);
        throw error;
    }
};

export default createInvitationLink;
