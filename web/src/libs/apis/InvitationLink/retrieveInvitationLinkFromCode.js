import api from "../../../api.js";

const retrieveInvitationLinkFromCode = async (params) => {
    try {
        const response = await api.get("invitation-link/retrieve-from-code/", {
            params,
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default retrieveInvitationLinkFromCode;
