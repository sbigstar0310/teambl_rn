import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    content: string;
    related_project_card_id?: number;
    related_post_id?: number;
    related_comment_id?: number;
    related_user_id?: number;
};

type Response = api.Report;

const createReport = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.post<api.Report>("report/create/", params);
        return response.data;
    } catch (error) {
        console.error("Error in creating report:", error);
        throw new Error("Failed to create report.");
    }
};

export default createReport;
