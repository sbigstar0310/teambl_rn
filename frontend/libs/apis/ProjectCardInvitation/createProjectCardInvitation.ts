import api from "@/shared/api";

type RequestParams = {
    project_card: number;
    invited_users: number[];
    message?: string;
};

type Response = api.ProjectCardInvitation;

const createProjectCardInvitation = async (params: RequestParams): Promise<Response> => {
    const response = await api.post<Response>("project-card/invitation/create/", params);
    return response.data;
};

export default createProjectCardInvitation;
