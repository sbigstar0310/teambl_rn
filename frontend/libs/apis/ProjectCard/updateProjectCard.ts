import api from "@/shared/api";

type RequestParams = {
    title?: string;
    keywords?: string[];
    accepted_users?: number[];
    start_date?: string | null;
    end_date?: string | null;
    description?: string;
};

// type Response = {
//     id: number;
//     title: string;
//     keywords: string[];
//     accepted_users: number[];
//     start_date?: string;
//     end_date?: string;
//     description: string;
//     creator: number;
// };
type Response = api.ProjectCard;

const updateProjectCard = async (projectId: number, params: RequestParams): Promise<Response> => {
    const response = await api.patch<Response>(`project-card/${projectId}/update/`, params);
    return response.data;
};

export default updateProjectCard;
