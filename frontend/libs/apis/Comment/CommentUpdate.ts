import api from "@/shared/api";

type RequestParams = {
    comment_id: number; // 수정할 댓글 ID
    content: string; // 변경할 댓글 내용
};

type Response = api.Comment; // 서버에서 반환하는 댓글 데이터 타입

const updateComment = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.patch<Response>(`${params.comment_id}/edit/`, {
            content: params.content,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating comment:", error);
        throw new Error("Failed to update comment.");
    }
};

export default updateComment;
