import api from "@/shared/api";

type RequestParams = {
    to_user: number; // 친구로 추가하려는 사용자 ID (수정된 필드명)
};

type Response = api.Friend;

const createFriend = async (params: RequestParams): Promise<Response> => {
    try {
        // POST 요청으로 친구 추가
        console.log(params);
        const response = await api.post<Response>("friend/create/", params);

        console.log("Friend request sent successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create friend:", error);
        throw error; // 에러를 다시 던져 호출자에서 처리할 수 있도록 함
    }
};

export default createFriend;
