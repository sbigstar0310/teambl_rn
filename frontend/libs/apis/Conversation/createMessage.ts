import api from "@/shared/api";

type RequestParams = {
    message?: string;
    image?: File | Blob; // 이미지 파일
};

type Response = api.Message; // 서버에서 반환되는 단일 메시지

const createMessage = async (conversationId: string, params: RequestParams): Promise<Response> => {
    try {
        // FormData 객체 생성
        const formData = new FormData();
        if (params.message) {
            formData.append("message", params.message);
        }
        if (params.image) {
            formData.append("image", params.image);
        }

        // POST 요청으로 메시지 생성
        const response = await api.post<Response>(`conversation/messages/${conversationId}/create/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data; // 생성된 메시지 반환
    } catch (error) {
        console.error("Failed to create a new message:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default createMessage;
