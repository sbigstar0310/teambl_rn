import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

// class InvitationLinkList(generics.ListAPIView):
//     serializer_class = InvitationLinkSerializer
//     permission_classes = [IsAuthenticated]
//     pagination_class = None

//     def get_queryset(self):
//         invitee_id = self.request.query_params.get("invitee_id", None)

//         if (
//             invitee_id
//         ):  # invitee_id가 unique하므로, inviter 조건 없이 invitee_id로만 필터링
//             queryset = InvitationLink.objects.filter(invitee_id=invitee_id)
//         else:
//             queryset = InvitationLink.objects.filter(
//                 inviter=self.request.user
//             )  # invitee_id가 없는 경우 로그인한 user가 초대한 링크들 반환

//         # print(f"Fetching InvitationLinks for invitee_id: {invitee_id}")
//         # print(f"Queryset: {queryset}")

//         return queryset

type RequestParams = {
    invitee_id?: number;
};

type Response = api.InvitationLink[];

// Fetches invitation links from the server
// invitee_id: Optional.
// If provided, fetches invitation links for the invitee_id.
// If not provided, fetches invitation links for the inviter(logged-in user).
const fetchInvitationLinks = async (
    params?: RequestParams
): Promise<Response> => {
    try {
        const response = await api.get<Response>("invitation-link/list/", {
            params,
        });
        return response.data;
    } catch (error) {
        console.log("Error in fetchInvitationLinks", error);
        throw error;
    }
};

export default fetchInvitationLinks;
