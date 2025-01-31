import api from "@/shared/api";

type RequestParams = {
    content: string; // 게시물 내용
    tagged_users: number[];
    images: (File | Blob)[]; // 게시물 이미지 (선택)
};

const postCreate = async (params: RequestParams): Promise<api.Post> => {
    try {
        // FormData 객체 생성
        const formData = new FormData();
        formData.append("content", params.content);
        formData.append("tagged_users", JSON.stringify(params.tagged_users));
        params.images.forEach((image) => {
            formData.append("images", image);
        });

        const response = await api.post<api.Post>("post/create/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data; // 생성된 게시물 데이터 반환
    } catch (error) {
        console.error("Failed to create a new post:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default postCreate;
