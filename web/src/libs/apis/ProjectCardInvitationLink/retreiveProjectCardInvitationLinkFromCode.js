import api from "../../../api.js";

const retreiveProjectCardInvitationLinkFromCode = async (params) => {
    try {
        const response = await api.get(
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
