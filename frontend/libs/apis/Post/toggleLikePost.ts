import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    liked_users: number[];
};

type Response = api.Post;

// 게시물 좋아요 토글 API (/post/{postId}/update/)를 호출하는 함수
// 새롭게 업데이트 할 likes_users 필드를 전달해야 함
// [1, 2] -> [1, 2, 3] (3번 유저가 좋아요를 누름)
// [1, 2] -> [1] (2번 유저가 좋아요를 취소함)

const toggleLikePost = async (
    postId: number,
    params: RequestParams
): Promise<Response> => {
    const response = await api.patch<Response>(`post/${postId}/update/`, {
        params,
    });
    return response.data;
};

export default toggleLikePost;
