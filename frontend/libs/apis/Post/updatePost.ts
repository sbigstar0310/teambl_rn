import api from "@/shared/api";

type RequestParams = {
    title?: string; // 업데이트할 게시물 제목 (선택)
    content?: string; // 업데이트할 게시물 내용 (선택)
    image?: File | Blob; // 업데이트할 게시물 이미지 (선택)
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
        if (params.image) {
            formData.append("image", params.image);
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
