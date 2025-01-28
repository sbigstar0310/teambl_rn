import api from "@/shared/api";

type RequestParams = {
    status: string; // 업데이트할 상태 (예: "accepted", "rejected")
};

const updateFriend = async (pk: number, params: RequestParams): Promise<api.Friend> => {
    try {
        // PUT 요청으로 친구 관계 업데이트
        const response = await api.put<api.Friend>(`friend/${pk}/update/`, params);

        const updatedFriendship = response.data;

        console.log("Friend relationship updated successfully:", updatedFriendship);

        return updatedFriendship; // 업데이트된 친구 관계 반환
    } catch (error) {
        console.error("Failed to update friend relationship:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default updateFriend;
