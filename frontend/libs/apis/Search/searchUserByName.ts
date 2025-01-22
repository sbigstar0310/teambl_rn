import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    user_name: string;
};

type Response = api.UserSearchResult[];

const searchUserByName = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.post<Response>("search/name/", params);
        return response.data;
    } catch (error) {
        console.error("searchUserByName error: ", error);
        throw error;
    }
};

export default searchUserByName;
