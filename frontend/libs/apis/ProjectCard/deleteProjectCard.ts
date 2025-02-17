import api from "@/shared/api";

type Response = {
    message: string;
};

const deleteProjectCard = async (projectId: number): Promise<Response> => {
    const response = await api.patch<Response>(`project-card/${projectId}/leave/`);
    return response.data;
};

export default deleteProjectCard;
