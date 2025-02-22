import api from "../../../api.js";

const projectCardInvitationResponse = async (invitationCode, status) => {
    if (status !== "accepted" && status !== "rejected") throw new Error("Invalid status to update invitation");
    try {
        const response = await api.get(
            `api/project-card/invitation/response-by-code/?code=${invitationCode}&status=${status}`
        );
        return response.data;
    } catch (error) {
        console.error(
            "Error in responding to project card invitation:",
            error
        );
        throw error;
    }
};

export default projectCardInvitationResponse;