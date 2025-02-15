import api from "@/shared/api";
import fetchPostById from "./fetchPostById";

type Response = api.Post;

// 게시물 좋아요 토글 API (/post/{postId}/update/)를 호출하는 함수
// 새롭게 업데이트 할 likes_users 필드를 전달해야 함
// [1, 2] -> [1, 2, 3] (3번 유저가 좋아요를 누름)
// [1, 2] -> [1] (2번 유저가 좋아요를 취소함)

const toggleLikePost = async (
    postId: number,
    myId: number
): Promise<Response> => {
    try {
        // 게시물 정보를 불러옴
        const post = await fetchPostById(postId);

        // 좋아요를 누른 유저 목록
        const likedUserIds = (post.liked_users as any) as number[];

        // 현재 유저가 이미 좋아요를 눌렀는지 확인
        const isLiked = likedUserIds.includes(myId);

        // 새로 업데이트할 liked_users 필드
        const newLikedUsers = isLiked
            ? likedUserIds.filter(id => id !== myId) // Remove like
            : [...likedUserIds, myId] // Add like as an object

        // 좋아요 토글 요청
        const response = await api.patch<Response>(`post/${postId}/update/`, {
            liked_users: newLikedUsers,
        });

        return response.data;
    } catch (error) {
        console.error("Error in Toggling Like", error);
        throw error;
    }
};

export default toggleLikePost;
