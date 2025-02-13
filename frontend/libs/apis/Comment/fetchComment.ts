import api from "@/shared/api";

type RequestParams = {
    post_id: number; // 댓글을 가져올 게시물(Post) ID
};

type Response = api.Comment[]; // 서버에서 반환하는 댓글 리스트 타입

const fetchComments = async (params: RequestParams): Promise<Response> => {
    try {
        const response = await api.get<Response>(`comment/${params.post_id}/list`);
        return response.data;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw new Error("Failed to fetch comments.");
    }
};

export default fetchComments;
