import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type Response = api.Notification[];

const fetchNotifications = async (): Promise<Response> => {
    const response = await api.get<Response>("notification/list/");
    return response.data;
};

export default fetchNotifications;
