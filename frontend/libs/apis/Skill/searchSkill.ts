import api from "@/shared/api";

const searchSkill = async (query: string): Promise<api.Skill[]> => {
    try {
        const response = await api.get<api.Skill[]>(`skill/search/?query=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error("Failed to search skills:", error);
        throw error;
    }
};

export default searchSkill;