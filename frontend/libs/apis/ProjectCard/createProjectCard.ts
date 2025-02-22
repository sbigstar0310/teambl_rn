import api from "@/shared/api";

type RequestParams = {
    title: string;
    keywords: string[];
    accepted_users: number[];
    creator: number;
    start_date?: string | null;
    end_date?: string | null;
    description: string;
};

type Response = api.ProjectCard;

const createProjectCard = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.post<Response>(
            "project-card/create/",
            params
        );
        console.log("params", params);
        return response.data;
    } catch (error) {
        console.error("Error creating project card:", error);
        throw error;
    }
};

export default createProjectCard;
