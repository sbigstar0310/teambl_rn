import api from "@/shared/api";

type RequestParams = {
    project_card_id: number;
};

type Response = {
    project_card_id: number;
    unique_id: string;
};

const createProjectLink = async (params: RequestParams): Promise<Response> => {
    const response = await api.post<Response>("project-card/link/", params);
    return response.data;
};

export default createProjectLink;
