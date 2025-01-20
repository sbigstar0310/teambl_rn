import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";

const fetchCurrentUser = async (): Promise<api.User | null> => {
    try {
        const response = await api.get<api.User>("user/current/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch current user", error);
        return null; // 실패 시 null 반환
    }
};

export default fetchCurrentUser;