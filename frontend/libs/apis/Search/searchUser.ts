import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    q: string;
    degree: number[];
};

type Response = {
    count: number;
    next: string | null;
    previous: string | null;
    results: api.UserSearchResult[];
};

const searchUser = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.post<Response>("search/user/", params);
        return response.data;
    } catch (error) {
        console.error("searchUser error: ", error);
        throw error;
    }
};

export default searchUser;
