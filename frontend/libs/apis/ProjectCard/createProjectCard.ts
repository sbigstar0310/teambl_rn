import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    title: string;
    keywords: string[];
    accepted_users: number[];
    creator: number;
    start_date: string;
    end_date?: string;
    desciption: string;
};

type Response = api.ProjectCard;

const createProjectCard = async (params: RequestParams): Promise<Response> => {
    const response = await api.post<Response>("project-card/create/", params);
    return response.data;
};

export default createProjectCard;
