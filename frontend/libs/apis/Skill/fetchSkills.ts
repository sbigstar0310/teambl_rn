import api from "@/shared/api";
import { ACCESS_TOKEN } from "@/shared/constants";

// 사용자의 스킬 목록을 가져오는 함수
const fetchSkills = async (): Promise<api.Skill[]> => {
    try {
        const response = await api.get<api.Skill[]>("skill/list/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch skills:", error);
        throw error;
    }
};

export default fetchSkills;