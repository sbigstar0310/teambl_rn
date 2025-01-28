import api from "@/shared/api";

type Response = {
    detail?: string;
};

const deleteConversation = async (conversationId: string): Promise<Response> => {
    try {
        // DELETE 요청으로 대화 삭제
        const response = await api.delete<Response>(`conversation/conversations/${conversationId}/delete/`);
        return response.data; // 성공 응답 반환
    } catch (error) {
        console.error("Failed to delete a conversation:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default deleteConversation;
