import api from "@/shared/api";

type Response = {
    last_message: api.Message | null;
};

const getLatestMessage = async (conversationId: string): Promise<Response["last_message"] | undefined> => {
    try {
        // GET 요청으로 최신 메시지 가져오기
        const response = await api.get<Response>(`conversation/conversations/${conversationId}/last-message/`);
        return response.data?.last_message; // 최신 메시지 반환
    } catch (error) {
        console.error("Failed to fetch latest message:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default getLatestMessage;
