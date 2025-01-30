import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";
import getUserInfo from "../User/getUserInfo";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getCurrentUserId } from "@/shared/utils";

type Response = api.Friend[];

// status와 관계없이 해당 유저와 관련된 친구 리스트를 가져오는 API
const fetchFriendList = async (user_id: number): Promise<Response> => {
    try {
        const response = await api.get<api.Friend[]>(`friend/${user_id}/list/`);
        const friendList = response.data;
        return friendList;
    } catch (error) {
        console.error("Failed to fetch friend list:", error);
        throw error;
    }
};

export default fetchFriendList;
