import api from "@/shared/api";

const cancelFriendRequest = async (requestId: number): Promise<void> => {
    try {
        // DELETE 요청으로 친구 요청 취소
        await api.delete(`friend/request-cancel/${requestId}/`);

        console.log(`Friend request with ID ${requestId} has been successfully canceled.`);
    } catch (error) {
        console.error(`Failed to cancel friend request with ID ${requestId}:`, error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default cancelFriendRequest;