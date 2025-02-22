import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.ProjectCardInvitationLink;

const deleteProjectCardInvitationLink = async (
    project_card_id: number
): Promise<Response> => {
    try {
        const response = await api.delete<Response>(
            `project-card-invitation-link/${project_card_id}/delete/`
        );
        return response.data;
    } catch (error) {
        console.error("Error in deleting projectCardInvitationLink", error);
        throw error;
    }
};

export default deleteProjectCardInvitationLink;
