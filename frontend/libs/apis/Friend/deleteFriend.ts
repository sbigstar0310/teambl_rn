import api from "@/shared/api";

const deleteFriend = async (pk: number): Promise<void> => {
    try {
        // DELETE 요청으로 친구 관계 삭제
        await api.delete(`friend/${pk}/delete/`);

        console.log(`Friend relationship with ID ${pk} has been successfully deleted.`);
    } catch (error) {
        console.error(`Failed to delete friend relationship with ID ${pk}:`, error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default deleteFriend;
