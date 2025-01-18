import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    q: string;
    degree: number[];
};

type Response = {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
        is_new_user: boolean;
        relation_degree: number | null;
        user: api.User;
    }[];
};

const searchUser = async (params: RequestParams): Promise<Response> => {
    const response = await api.post<Response>("/search/", params);
    return response.data;
};

export default searchUser;
