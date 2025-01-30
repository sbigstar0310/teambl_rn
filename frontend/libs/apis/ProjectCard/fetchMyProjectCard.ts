import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.ProjectCard[];

// 현재 유저가 참여하고 있는 모든 프로젝트 카드를 불러옵니다.
const fetchMyProjectCard = async (): Promise<Response> => {
    try {
        const response = await api.get<Response>("project-card/list/current/");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default fetchMyProjectCard;
