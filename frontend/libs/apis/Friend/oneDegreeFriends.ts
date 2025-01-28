import api from "@/shared/api";

const fetchOneDegreeFriends = async (): Promise<api.Friend[]> => {
    try {
        // GET 요청으로 1촌 친구 목록 가져오기
        const response = await api.get<api.Friend[]>("friend/one-degree/");
        
        console.log("Fetched one-degree friends:", response.data);

        return response.data; // 1촌 친구 목록 반환
    } catch (error) {
        console.error("Failed to fetch one-degree friends:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default fetchOneDegreeFriends;
