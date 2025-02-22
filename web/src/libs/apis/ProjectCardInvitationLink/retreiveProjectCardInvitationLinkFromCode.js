import api from "../../../api.js";

const retrieveProjectCardInvitationLinkFromCode = async (code) => {
    try {
        const response = await api.get(
            "api/project-card-invitation-link/retrieve-from-code/",
            { params: { code } }
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

export default retrieveProjectCardInvitationLinkFromCode;
