import api from "@/shared/api";

type RequestParams = {
    to_user_id: number; // 친구로 추가하려는 사용자 ID (수정된 필드명)
};

const createFriend = async (params: RequestParams): Promise<api.Friend> => {
    try {
        // 요청 데이터 검증
        if (!params.to_user_id || typeof params.to_user_id !== "number") {
            throw new Error("Invalid to_user_id. It must be a valid user ID (number).");
        }

        // POST 요청으로 친구 추가
        const response = await api.post<api.Friend>(
            "friend/list-or-create/",
            params, // to_user_id로 데이터 전송
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Friend request sent successfully:", response.data);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 400) {
            console.error("Bad Request - Invalid data:", error.response?.data);
        } else {
            console.error("Failed to create friend:", error);
        }
        throw error; // 에러를 다시 던져 호출자에서 처리할 수 있도록 함
    }
};

export default createFriend;