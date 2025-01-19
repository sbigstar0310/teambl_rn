import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = {};

const deleteNotification = async (id: number) => {
    const response = await api.delete<Response>(`notification/${id}/delete/`);
};

export default deleteNotification;
