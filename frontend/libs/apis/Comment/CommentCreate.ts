import api from "@/shared/api";

type RequestParams = {
    post_id: number;  // 댓글을 작성할 게시물(Post) ID
    content: string;  // 댓글 내용
    parent_comment?: number;  // 부모 댓글 ID (대댓글인 경우)
};

const createComment = async (params: RequestParams): Promise<api.Comment> => {
    try {
        const response = await api.post<api.Comment>(`post/${params.post_id}/create`, params);
        return response.data;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw new Error("Failed to create comment.");
    }
};

export default createComment;