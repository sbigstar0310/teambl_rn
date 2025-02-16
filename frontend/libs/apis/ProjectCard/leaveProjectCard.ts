import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {};

type Response = api.ProjectCard;

// 해당 프로젝트 카드에서 나가는(탈퇴하는) API
// ** 프로젝트 카드 삭제가 아님 **
const leaveProjectCard = async (project_card_id: number): Promise<Response> => {
    try {
        const response = await api.post<Response>(
            `project-card/${project_card_id}/leave/`
        );
        return response.data;
    } catch (error) {
        console.log("Error in Leaving Project Card", error);
        throw error;
    }
};

export default leaveProjectCard;
