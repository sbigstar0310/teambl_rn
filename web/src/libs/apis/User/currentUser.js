import api from "../../../api.js";

const fetchCurrentUser = async () => {
    try {
        const response = await api.get("user/current/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch current user", error);
        return null; // 실패 시 null 반환
    }
};

export default fetchCurrentUser;
