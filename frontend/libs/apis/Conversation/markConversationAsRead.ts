import api from "@/shared/api";

const markConversationAsRead = async (conversationId: string): Promise<void> => {
    try {
        // PATCH 요청으로 대화를 읽음 상태로 업데이트
        await api.patch(`/conversation/conversations/${conversationId}/read/`);
        console.log(`Conversation ${conversationId} marked as read.`);
    } catch (error) {
        console.error(`Failed to mark conversation ${conversationId} as read:`, error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default markConversationAsRead;
