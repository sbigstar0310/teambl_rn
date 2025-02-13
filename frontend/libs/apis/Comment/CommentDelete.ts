import api from "@/shared/api";

type RequestParams = {
    comment_id: number; // 삭제할 댓글 ID
};

const deleteComment = async (params: RequestParams): Promise<void> => {
    try {
        await api.delete(`comment/${params.comment_id}/delete/`);
        console.log(`Comment ${params.comment_id} deleted successfully`);
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw new Error("Failed to delete comment.");
    }
};

export default deleteComment;
