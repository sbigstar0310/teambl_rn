import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = {
    detail?: string;
};

const deleteUser = async (): Promise<Response> => {
    const response = await api.delete<Response>("user/delete/");
    return response.data;
};

export default deleteUser;
