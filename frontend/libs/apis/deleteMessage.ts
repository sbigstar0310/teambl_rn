import api from "../../shared/api";

type Response = {
    detail?: string;
};

const deleteMessage = async (messageId: string): Promise<Response> => {
    try {
        // PATCH 요청으로 메시지 삭제
        const response = await api.patch<Response>(`conversation/messages/${messageId}/delete/`);
        return response.data; // 성공 응답 반환
    } catch (error) {
        console.error("Failed to delete a message:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default deleteMessage;
