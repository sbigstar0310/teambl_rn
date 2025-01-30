import api from "@/shared/api";

// Pending 중인 요청을 취소하는 API
// Warning: This API is not for "accept" or "reject" friend requests.
const cancelFriendRequest = async (friend_id: number): Promise<void> => {
    try {
        // DELETE 요청으로 친구 요청 취소
        await api.delete(`friend/${friend_id}/request-cancel/`);

        console.log(
            `Friend request with ID ${friend_id} has been successfully canceled.`
        );
    } catch (error) {
        console.error(
            `Failed to cancel friend request with ID ${friend_id}:`,
            error
        );
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default cancelFriendRequest;
