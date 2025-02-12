import api from "@/shared/api";

type RequestParams = {
    project_card_id?: number; // 특정 프로젝트 카드 ID로 필터링 (선택)
};

const fetchPostList = async (params?: RequestParams): Promise<api.Post[]> => {
    try {
        let url = "post/list/";

        if (params?.project_card_id) {
            url = `post/list/?project_card_id=${params.project_card_id}`; // 특정 프로젝트 카드 ID로 필터링
        }

        const response = await api.get<api.Post[]>(url);
        return response.data; // 게시물 리스트 반환
    } catch (error: any) {
        console.error("Failed to fetch post list:", error?.response?.data || error.message);
        throw new Error(error?.response?.data?.detail || "An error occurred while fetching posts.");
    }
};

export default fetchPostList;