import api from "@/shared/api";
import {PostImage} from "@/components/forms/PostCreateForm";

type RequestParams = {
    title?: string; // 업데이트할 게시물 제목 (선택)
    content?: string; // 업데이트할 게시물 내용 (선택)
    tagged_users?: number[];
    images?: PostImage[]; // 게시물 이미지 (선택)
};

const updatePost = async (postId: number, params: RequestParams): Promise<api.Post> => {
    try {
        // FormData 객체 생성
        const formData = new FormData();

        if (params.title) {
            formData.append("title", params.title);
        }
        if (params.content) {
            formData.append("content", params.content);
        }
        if (params.tagged_users) {
            for (const userId of params.tagged_users) {
                formData.append("tagged_users", String(userId));
            }
        }
        if (params.images) {
            for (const image of params.images) {
                // Prevents axios Network error by correctly setting mime type
                if (!image.type.startsWith("image/")) {
                    image.type = "image/" + image.type;
                }
                formData.append("images", image as any);
            }
        }

        // PUT 요청으로 게시물 업데이트
        const response = await api.put<api.Post>(`post/${postId}/update/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data; // 업데이트된 게시물 반환
    } catch (error) {
        console.error("Failed to update the post:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default updatePost;
