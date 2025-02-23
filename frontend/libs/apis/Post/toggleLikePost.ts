import api from "@/shared/api";
import fetchPostById from "./fetchPostById";

type Response = api.Post;

// 게시물 좋아요 토글 API
// 로그인 유저 기준으로 좋아요를 토클하는 API
const toggleLikePost = async (postId: number): Promise<Response> => {
    try {
        // 좋아요 토글 요청
        const response = await api.post<Response>(`post/${postId}/like/`);
        return response.data;
    } catch (error) {
        console.error("Error in Toggling Like", error);
        throw error;
    }
};

export default toggleLikePost;
