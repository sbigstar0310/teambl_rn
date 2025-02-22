import api from "../../../api.js";

const getUserInfo = async (user_id) => {
    try {
        const response = await api.get(`user/${user_id}/get/`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
        throw error;
    }
};

export default getUserInfo;
