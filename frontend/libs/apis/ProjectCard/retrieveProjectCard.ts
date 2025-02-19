import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.ProjectCard;

const retrieveProjectCard = async (
    project_card_id: number
): Promise<Response> => {
    try {
        const response = await api.get<Response>(
            `project-card/${project_card_id}/retrieve/`
        );
        return response.data;
    } catch (error) {
        console.error("Failed to retrieve project card:", error);
        throw error;
    }
};

export default retrieveProjectCard;
