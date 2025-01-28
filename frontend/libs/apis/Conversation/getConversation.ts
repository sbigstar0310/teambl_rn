import api from "@/shared/api";

type Response = api.Conversation[]; // 응답은 대화 목록 배열입니다.

const getConversations = async (): Promise<Response> => {
    try {
        // GET 요청으로 대화 목록 가져오기
        const response = await api.get<Response>("conversation/conversations/");
        return response.data; // 데이터 반환
    } catch (error) {
        console.error("Failed to fetch conversations:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default getConversations;
