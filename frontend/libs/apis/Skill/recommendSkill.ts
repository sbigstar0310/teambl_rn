import api from "@/shared/api";

const recommendSkill = async (): Promise<api.Skill[]> => {
    try {
        const response = await api.get<api.Skill[]>("skill/recommendations/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch recommended skills:", error);
        throw error;
    }
};

export default recommendSkill;