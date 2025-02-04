import api from "@/shared/api";

const deleteSkill = async (skillId: number): Promise<void> => {
    try {
        await api.delete(`skill/delete/${skillId}/`);
        console.log(`Skill with ID ${skillId} deleted successfully.`);
    } catch (error) {
        console.error(`Failed to delete skill with ID ${skillId}:`, error);
        throw error;
    }
};

export default deleteSkill;