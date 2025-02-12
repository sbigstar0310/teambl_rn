import api from "@/shared/api";

const fetchPostById = async (postId: number): Promise<api.Post> => {
    try {
        const url = `post/${postId}/`; // 특정 postId로 단일 게시물 조회
        const response = await api.get<api.Post>(url);

        return response.data; // 단일 Post 반환
    } catch (error: any) {
        console.error("Failed to fetch post:", error?.response?.data || error.message);
        throw new Error(error?.response?.data?.detail || "An error occurred while fetching the post.");
    }
};

export default fetchPostById;