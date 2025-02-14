import api from "@/shared/api";

type RequestParams = {
    content: string;  // 신고 내용
    related_project_card_id?: number;  // 프로젝트 카드 신고 (선택)
    related_post_id?: number;  // 게시글 신고 (선택)
    related_comment_id?: number;  // 댓글 신고 (선택)
    related_user_id?: number;  // 사용자 신고 (선택)
};

const createReport = async (params: RequestParams): Promise<api.Report> => {
    try {
        const response = await api.post<api.Report>("others/report/", params);
        return response.data;
    } catch (error) {
        console.error("Error creating report:", error);
        throw new Error("Failed to create report.");
    }
};

export default createReport;
