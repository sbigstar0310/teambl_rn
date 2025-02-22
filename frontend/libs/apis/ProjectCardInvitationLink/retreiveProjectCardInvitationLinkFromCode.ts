import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    code: string;
};

type Response = api.ProjectCardInvitationLink;

const retreiveProjectCardInvitationLinkFromCode = async (
    params: RequestParams
): Promise<Response> => {
    try {
        const response = await api.get<Response>(
            "project-card-invitation-link/retreive-from-code/",
            { params }
        );
        return response.data;
    } catch (error) {
        console.error(
            "Error in Retreiving ProjectCardInvitationLink from code",
            error
        );
        throw error;
    }
};

export default retreiveProjectCardInvitationLinkFromCode;
