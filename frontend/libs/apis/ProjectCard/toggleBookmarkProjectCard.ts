import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    projectCardId: number;
};

type Response = api.ProjectCard;

const toggleBookmarkProjectCard = async (
    params: RequestParams
): Promise<Response> => {
    try {
        const response = await api.patch<Response>(
            `project-card/${params.projectCardId}/bookmark-toggle/`
        );
        return response.data;
    } catch (error) {
        console.log("Error in toggle bookmark in project card", error);
        throw error;
    }
};

export default toggleBookmarkProjectCard;
