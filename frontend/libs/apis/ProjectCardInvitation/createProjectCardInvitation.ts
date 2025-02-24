import api from "@/shared/api";

type RequestParams = {
    project_card: number;
    invitee: number;
};

type Response = api.ProjectCardInvitation;

const createProjectCardInvitation = async (
    params: RequestParams
): Promise<Response> => {
    try {
        const response = await api.post<Response>(
            "project-card/invitation/create/",
            params
        );
        return response.data;
    } catch (error) {
        console.error("Error creating project card invitation:", error);
        throw error;
    }
};

export default createProjectCardInvitation;
