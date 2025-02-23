import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = {};

const deleteProjectCardInvitation = async (
    project_card_id: Number,
    invitee_id: Number
): Promise<Response> => {
    try {
        const response = await api.delete<Response>(
            `project-card/${project_card_id}/invitation/${invitee_id}/delete/`
        );
        return response.data;
    } catch (error) {
        console.log("Error in deleting projectCardInvitation", error);
        throw error;
    }
};

export default deleteProjectCardInvitation;
