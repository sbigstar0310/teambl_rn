import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.ProjectCard[];

const fetchOneDegreeProjectCard = async (
    user_id: number
): Promise<Response> => {
    try {
        const response = await api.get<Response>(
            `project-card/list/${user_id}/`
        );
        console.log("projectCardList: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching project card list:", error);
        throw error;
    }
};

export default fetchOneDegreeProjectCard;
