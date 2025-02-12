import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.InvitationLink;

const deleteInvitationLink = async (
    invitation_link_id: number
): Promise<Response> => {
    try {
        const response = await api.delete<Response>(
            `invitation-link/${invitation_link_id}/delete/`
        );
        return response.data;
    } catch (error) {
        console.error("deleteInvitationLink error", error);
        throw error;
    }
};

export default deleteInvitationLink;
