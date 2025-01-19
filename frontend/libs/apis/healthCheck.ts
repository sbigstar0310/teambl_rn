import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = {
    status: string;
};

// check if the backend-server is running
const healthCheck = async (): Promise<Response> => {
    const response = await api.get<Response>("others/health-check/");
    return response.data;
};

export default healthCheck;
