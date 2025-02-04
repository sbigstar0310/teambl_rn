import api from "@/shared/api";

const addSkill = async (skills: string[]): Promise<api.Skill[]> => {
    try {
        const response = await api.post<api.Skill[]>("skill/add/", { skills });
        return response.data;
    } catch (error) {
        console.error("Failed to add skills:", error);
        throw error;
    }
};

export default addSkill;