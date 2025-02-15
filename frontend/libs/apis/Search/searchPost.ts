import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    q: string;
};

type Response = {
    count: number;
    next: string | null;
    previous: string | null;
    results: api.Post[];
};

const searchPost = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.post<Response>("search/post/", params);
        return response.data;
    } catch (error) {
        console.error("Error in Searching Post", error);
        throw error;
    }
};

export default searchPost;
