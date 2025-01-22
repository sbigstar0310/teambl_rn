import api from "../../shared/api";

type Response = {
    system_messages: api.Message[];
    user1_messages: api.Message[];
    user2_messages: api.Message[];
};

const getMessages = async (conversationId: string): Promise<api.Message[]> => {
    try {
        // GET 요청으로 대화 메시지 가져오기
        const response = await api.get<Response>(`conversation/conversations/${conversationId}/messages/`);

        // 응답 데이터에서 메시지 배열 통합
        const systemMessages = response.data.system_messages ?? [];
        const user1Messages = response.data.user1_messages ?? [];
        const user2Messages = response.data.user2_messages ?? [];

        return [...systemMessages, ...user1Messages, ...user2Messages]; // 통합된 메시지 배열 반환
    } catch (error) {
        console.error("Failed to fetch list of messages:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default getMessages;
