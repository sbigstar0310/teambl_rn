import api from "@/shared/api";

type Status = "pending" | "accepted" | "rejected";

type RequestParams = {
    from_user?: number; // 친구 추가 요청을 보내는 사용자 ID
    to_user: number; // 친구로 추가하려는 사용자 ID (수정된 필드명)
    status?: Status; // 친구 요청 상태 (기본값: "pending")
};

type Response = api.Friend;

const createFriend = async (params: RequestParams): Promise<Response> => {
    try {
        // status 기본값을 적용
        const requestData: RequestParams = { status: "pending", ...params };

        // POST 요청으로 친구 추가
        console.log(requestData);
        const response = await api.post("friend/create/", requestData);

        console.log("Friend request sent successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create friend:", error);
        throw error; // 에러를 다시 던져 호출자에서 처리할 수 있도록 함
    }
};

export default createFriend;
