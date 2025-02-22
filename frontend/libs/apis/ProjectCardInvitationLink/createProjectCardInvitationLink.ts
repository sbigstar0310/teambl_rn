import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.ProjectCardInvitationLink;

const createProjectCardInvitationLink = async (
    project_card_id: number
): Promise<Response> => {
    try {
        const response = await api.post<Response>(
            `project-card-invitation-link/create/`,
            {
                project_card_id: project_card_id,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in creating projectCardInvitationLink", error);
        throw error;
    }
};

export default createProjectCardInvitationLink;
