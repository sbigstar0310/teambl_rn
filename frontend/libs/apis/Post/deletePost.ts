import api from "@/shared/api";

const deletePost = async (postId: number): Promise<void> => {
    try {
        // DELETE 요청으로 게시물 삭제
        await api.delete(`post/${postId}/delete/`);

        console.log(`Post with ID ${postId} has been successfully deleted.`);
    } catch (error) {
        console.error(`Failed to delete post with ID ${postId}:`, error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default deletePost;