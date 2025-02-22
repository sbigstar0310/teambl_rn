import api from "@/shared/api";

type Response = api.ProjectCardInvitationLink;

const createProjectCardInvitationLink = async (
    project_card: number
): Promise<Response> => {
    try {
        const response = await api.post<Response>(
            `project-card-invitation-link/create/`,
            {
                project_card
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in creating projectCardInvitationLink", error);
        throw error;
    }
};

export default createProjectCardInvitationLink;
