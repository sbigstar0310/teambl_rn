import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";
import getUserInfo from "../User/getUserInfo";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getCurrentUserId } from "@/shared/utils";

type RequestParams = Record<string, any>; // Adjust to match the API's expected params structure

const fetchFriendList = async (user_id: number): Promise<api.User[]> => {
    try {
        const response = await api.get<api.Friend[]>(`friend/${user_id}/list/`);
        const friendList = response.data;

        // Map friend list to extract relevant friend IDs
        const friendIdList = friendList.map((friend) =>
            friend.from_user.id === Number(user_id)
                ? friend.to_user.id
                : friend.from_user.id
        );

        const userList = await Promise.all(
            friendIdList.map(async (user_id) => {
                const userResponse = await getUserInfo(user_id);
                return userResponse;
            })
        );

        return userList;
    } catch (error) {
        console.error("Failed to fetch friend list:", error);
        throw error;
    }
};

export default fetchFriendList;
