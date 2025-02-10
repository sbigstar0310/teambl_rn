import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";
import fetchFriendList from "./fetchFriendList";

type RequestParams = {
    user1_id: number;
    user2_id: number;
};

type Response = {
    isRequested: boolean;
};

const isFriendRequested = async (params: RequestParams): Promise<Response> => {
    try {
        // Fetch Friend List
        const friendList = await fetchFriendList(params.user1_id);

        // Check if the user1 and user2 are friend with "pending" status
        const foundPendingRequest = friendList.find((friend) => {
            return (
                ((friend.from_user.id === params.user1_id &&
                    friend.to_user.id === params.user2_id) ||
                    (friend.from_user.id === params.user2_id &&
                        friend.to_user.id === params.user1_id)) &&
                friend.status === "pending"
            );
        });

        if (foundPendingRequest) {
            return { isRequested: true };
        } else {
            return { isRequested: false };
        }
    } catch (error) {
        console.error("Failed to check if friend is requested:", error);
        throw error;
    }
};

export default isFriendRequested;
