import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type Response = api.ProjectCardInvitation[];

// 유저에게 보내진 프로젝트 카드 초대 목록을 가져오는 API
// 상태는 따로 필터링 필요 (pending, accepted, rejected)
const fetchMyProjectCardInvitations = async (): Promise<Response> => {
    try {
        const response = await api.get<Response>(
            "project-card/invitation/list/current/"
        );
        console.log("fetchMyProjectCardInvitations response: ", response.data);
        return response.data;
    } catch (error) {
        console.error(
            "Error in fetching current user's ProjectCardInvitations",
            error
        );
        throw error;
    }
};

export default fetchMyProjectCardInvitations;
