import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.ProjectCard[];

const fetchBookmarkedProjectCards = async (): Promise<Response> => {
    try {
        const response = await api.get<Response>(
            "project-card/list/current/bookmarked/"
        );
        return response.data;
    } catch (error) {
        console.error("Error in fetching bookmarked project cards", error);
        throw error;
    }
};

export default fetchBookmarkedProjectCards;
