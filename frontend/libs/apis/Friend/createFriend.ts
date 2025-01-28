import api from "@/shared/api";
import getUserInfo from "../User/getUserInfo";

type RequestParams = {
    to_user: number; // 친구로 추가하려는 사용자 ID
};

const createFriend = async (params: RequestParams): Promise<api.Friend> => {
    try {
        // 친구 추가 요청
        const response = await api.post<api.Friend>("friend/list-or-create/", params);

        const createdFriendship = response.data;

        // 친구의 사용자 정보 가져오기
        const friendId =
            createdFriendship.from_user.id === params.to_user
                ? createdFriendship.from_user.id
                : createdFriendship.to_user.id;

        const friendInfo = await getUserInfo(friendId);

        console.log("Friend added successfully:", friendInfo);

        return createdFriendship; // 생성된 친구 관계 반환
    } catch (error) {
        console.error("Failed to create friend:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default createFriend;
