import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    code: string;
};

type Response = api.InvitationLink;

const retrieveInvitationLinkFromCode = async (
    params: RequestParams
): Promise<Response> => {
    try {
        const response = await api.get<Response>(
            "invitation-link/retrieve-from-code/",
            { params }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default retrieveInvitationLinkFromCode;
