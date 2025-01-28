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

        // 특정 화면으로 이동 (예: 알림의 링크를 열기)
        if (item.notification_type === "message") {
            router.push("/settings");
        } else if (item.notification_type === "project") {
            router.push("/settings");
        } else {
            console.log("Unhandled notification type:", item.notification_type);
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
