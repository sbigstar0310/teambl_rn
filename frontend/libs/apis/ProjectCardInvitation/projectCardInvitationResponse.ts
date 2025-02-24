import api from "@/shared/api";

type RequestParams = {
    status: "accepted" | "rejected";
};

type Response = api.ProjectCardInvitation;

const projectCardInvitationResponse = async (
    invitationId: number,
    params: RequestParams
): Promise<Response> => {
    const response = await api.patch<Response>(
        `project-card/invitation/${invitationId}/response/`,
        params
    );
    return response.data;
};

export default projectCardInvitationResponse;
