import api from "../../shared/api";

type RequestParams = {
    user_2: string; // 상대방 사용자 ID
};

type Response = {
    id: string; // 대화 ID
    user_1: string; // 현재 사용자 ID
    user_2: string; // 상대방 사용자 ID
    created_at: string; // 대화 생성 시간
    updated_at: string; // 대화 마지막 업데이트 시간
};

const createConversation = async (otherUserId: string): Promise<Response> => {
    try {
        // POST 요청으로 대화 생성
        const response = await api.post<Response>("conversation/conversations/create/", { user_2: otherUserId });
        return response.data; // 생성된 대화 데이터 반환
    } catch (error) {
        console.error("Failed to create a new chat:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default createConversation;
