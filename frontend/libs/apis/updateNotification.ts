import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = Partial<api.Notification>; // Make all properties optional to allow partial update

type Response = api.Notification;

const updateNotification = async (
    params: RequestParams,
    id: number
): Promise<Response> => {
    const response = await api.patch<Response>(
        `notification/${id}/update/`,
        params
    );
    return response.data;
};

export default updateNotification;
