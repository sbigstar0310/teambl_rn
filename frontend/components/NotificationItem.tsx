import { View, Text, Pressable } from "react-native";
import React, { FC } from "react";
import styled from "@emotion/native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko"; // 한국어 로케일 사용
import XIcon from "@/assets/delete-x-icon.svg";
import { isEnabled } from "react-native/Libraries/Performance/Systrace";
import updateNotificationAPI from "@/libs/apis/Notification/updateNotification";
import deleteNotificationAPI from "@/libs/apis/Notification/deleteNotification";
import { timeAgo } from "@/shared/utils";
import { useRouter } from "expo-router";

dayjs.extend(relativeTime);
dayjs.locale("ko");

type Props = {
    item: api.Notification;
    markAsRead: (is_read: boolean, id: number) => void;
    deleteNotification: (id: number) => void;
};

const Container = styled.Pressable<{ isRead: boolean }>`
    height: 74px;
    flex-direction: row;
    background-color: ${({ isRead }) => (isRead ? "white" : "#EEF4FF")};
    padding-horizontal: 16px;
`;

const LeftContainer = styled.View`
    flex: 1;
    align-items: left;
    justify-content: center;
`;

const RightContainer = styled.View`
    min-width: 64px;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    padding-top: 10px;
    padding-bottom: 20px;
`;

const Message = styled.Text`
    color: #121212;
    font-family: Pretendard;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
`;

const TimeAgo = styled.Text`
    color: #595959;
    text-align: right;
    font-family: Pretendard;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    padding-right: 10px;
`;

const CloseButton = styled.TouchableOpacity`
    padding-vertical: 10px;
    padding-horizontal: 10px;
`;

// const timeAgo = (timestamp: string): string => {
//     return dayjs(timestamp).fromNow(); // 상대 시간 반환
// };

// const NotificationItem: FC<Props> = ({
//     item,
//     markAsRead,
//     deleteNotification,
// }) => {
//     return (
//         <Container
//             onPress={() => markAsRead(item.is_read, item.id)}
//             isRead={item.is_read}
//         >
//             <LeftContainer>
//                 <Message numberOfLines={2}>{item.message}</Message>
//             </LeftContainer>
//             <RightContainer>
//                 <CloseButton onPress={() => deleteNotification(item.id)}>
//                     <XIcon />
//                 </CloseButton>
//                 <TimeAgo>{timeAgo(item.created_at)}</TimeAgo>
//             </RightContainer>
//         </Container>
//     );
// };

// export default NotificationItem;

const NotificationItem: FC<Props> = ({
    item,
    markAsRead,
    deleteNotification,
}) => {
    const router = useRouter();

    const handlePress = () => {
        // 읽음 처리
        markAsRead(item.is_read, item.id);

        switch (item.notification_type) {
            case "invitation_register":
            case "friend_accept":
                if (item.related_user_id) {
                    router.push(`/profiles/${item.related_user_id}/project`);
                } else {
                    console.warn("related_user_id is missing, redirecting to home");
                    router.push("/");
                }
                break;
            case "invitation_expired":
                router.push(`/invite`);
                break;
            case "friend_reject":
            case "project_card_reject":
                break;
            case "friend_request":
                // router.push("/myfriends");
                router.push(`/myfriends?activeTab=내게 신청한`);
                break;
            case "project_card_invite":
            case "project_card_accept":
            case "project_card_update":
                router.push("/myprofile/project");
                break;
            case "project_card_recommend":
                if (item.related_project_card_id) {
                    router.push(`/project/${item.related_project_card_id}`);
                } else {
                    console.warn("related_project_card_id is missing, redirecting to home");
                    router.push("/");
                }
                break;
            case "post_create_team":
            case "post_update_team":
            case "post_create_save":
            case "post_update_save":
            case "post_like":
            case "comment_create":
            case "comment_child_create":
            case "comment_update":
            case "comment_child_update":
                if (item.related_post_id) {
                    router.push(`/posts/${item.related_post_id}`);
                } else {
                    console.warn("related_post_id is missing, redirecting to home");
                    router.push("/");
                }
                break;
            case "new_message":
                if (item.related_conversation_id) {
                    router.push(`/conversations/${item.related_conversation_id}`);
                } else {
                    console.warn("related_conversation_id is missing, redirecting to home");
                    router.push("/");
                }
                break;
            default:
                router.push("/");
                break;
        }
    };

    return (
        <Container onPress={handlePress} isRead={item.is_read}>
            <LeftContainer>
                <Message numberOfLines={2}>{item.message}</Message>
            </LeftContainer>
            <RightContainer>
                <CloseButton onPress={() => deleteNotification(item.id)}>
                    <XIcon />
                </CloseButton>
                <TimeAgo>{timeAgo(new Date(item.created_at))}</TimeAgo>
            </RightContainer>
        </Container>
    );
};

export default NotificationItem;
