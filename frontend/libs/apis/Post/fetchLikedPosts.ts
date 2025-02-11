import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.Post[];

const fetchLikedPosts = async (): Promise<Response> => {
    try {
        const response = await api.get<Response>("post/list/liked/");
        return response.data;
    } catch (error) {
        console.error("Error in fetching liked posts", error);
        throw error;
    }
};

export default fetchLikedPosts;
