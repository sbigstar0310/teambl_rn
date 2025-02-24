// import React, { useEffect, useState } from "react";
// import {
//     StyleSheet,
//     Text,
//     View,
//     FlatList,
//     TouchableOpacity,
//     ActivityIndicator,
// } from "react-native";
// import { Stack } from "expo-router";
// import { useNavigation } from "@react-navigation/native";
// import fetchNotificationsAPI from "@/libs/apis/Notification/fetchNotifications";
// import updateNotificationAPI from "@/libs/apis/Notification/updateNotification";
// import deleteNotificationAPI from "@/libs/apis/Notification/deleteNotification";
// import fetchCurrentUserAPI from "@/libs/apis/User/currentUser";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// import "dayjs/locale/ko"; // 한국어 로케일 사용
// import ScreenHeader from "@/components/common/ScreenHeader";
// import { sharedStyles } from "../_layout";
// import NotificationItem from "@/components/NotificationItem";
// import eventEmitter from "@/libs/utils/eventEmitter";

// dayjs.extend(relativeTime);
// dayjs.locale("ko");

// const Notification = () => {
//     const navigation = useNavigation();
//     const [notifications, setNotifications] = useState<api.Notification[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [currentUser, setCurrentUser] = useState<api.User | null>(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             await fetchNotifications();
//             await fetchCurrentUser();
//             setLoading(false); // 모든 데이터가 로드된 후 로딩 상태 해제
//         };

//         fetchData();
//     }, []);

//     // 현재 로그인한 유저 정보 불러오기
//     const fetchCurrentUser = async () => {
//         try {
//             const currentUser = await fetchCurrentUserAPI();
//             setCurrentUser(currentUser);
//             console.log("fetched current user: ", currentUser);
//         } catch (error) {
//             console.error("Failed to fetch current user", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchNotifications = async () => {
//         try {
//             const notificationList = await fetchNotificationsAPI();
//             setNotifications(notificationList);
//         } catch (error) {
//             console.error("Failed to fetch notifications", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const markAsRead = async (is_read: boolean, id: number) => {
//         // check notification is already read
//         if (is_read) {
//             return;
//         }

//         try {
//             const newNotification = await updateNotificationAPI(
//                 { is_read: true },
//                 id
//             );
//             setNotifications((prevNotifications) =>
//                 prevNotifications.map((notification) =>
//                     notification.id === id
//                         ? { ...notification, ...newNotification }
//                         : notification
//                 )
//             );
//             eventEmitter.emit("notificationRead");
//         } catch (error) {
//             console.error("Failed to update notification", error);
//         }
//     };

//     const deleteNotification = async (id: number) => {
//         try {
//             await deleteNotificationAPI(id);
//             setNotifications((prevNotifications) =>
//                 prevNotifications.filter(
//                     (notification) => notification.id !== id
//                 )
//             );
//         } catch (error) {
//             console.error("Failed to delete notification", error);
//         }
//     };

//     if (loading) {
//         return (
//             <ActivityIndicator
//                 size="large"
//                 color="#0000ff"
//                 style={styles.loader}
//             />
//         );
//     }

//     return (
//         <>
//             <Stack.Screen options={{ headerShown: false }} />
//             <ScreenHeader title="알림" />
//             <View style={[sharedStyles.container, styles.container]}>
//                 <FlatList
//                     data={notifications}
//                     keyExtractor={(item) => item.id.toString()}
//                     renderItem={({ item }) => (
//                         <NotificationItem
//                             item={item}
//                             markAsRead={markAsRead}
//                             deleteNotification={deleteNotification}
//                         />
//                     )}
//                 />
//             </View>
//         </>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#ffffff",
//         paddingTop: 20,
//         paddingHorizontal: 0,
//     },
//     header: {
//         fontSize: 20,
//         fontWeight: "600",
//         color: "#121212",
//         marginBottom: 20,
//     },
//     notification: {
//         padding: 15,
//         borderBottomWidth: 0.7,
//         borderBottomColor: "#ddd",
//     },
//     read: {
//         backgroundColor: "#f5f5f5",
//     },
//     unread: {
//         backgroundColor: "#eef4ff",
//     },
//     notificationHeader: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//     },
//     message: {
//         fontSize: 12,
//         color: "#121212",
//     },
//     deleteText: {
//         fontSize: 22,
//         color: "#A8A8A8",
//     },
//     createdAt: {
//         fontSize: 12,
//         color: "#595959",
//         marginTop: 5,
//     },
//     loader: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//     },
// });

// export default Notification;

import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
// import { useNavigation } from "@react-navigation/native";
import fetchNotificationsAPI from "@/libs/apis/Notification/fetchNotifications";
import updateNotificationAPI from "@/libs/apis/Notification/updateNotification";
import deleteNotificationAPI from "@/libs/apis/Notification/deleteNotification";
import fetchCurrentUserAPI from "@/libs/apis/User/currentUser";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko"; // 한국어 로케일 사용
import ScreenHeader from "@/components/common/ScreenHeader";
import { sharedStyles } from "../_layout";
import NotificationItem from "@/components/NotificationItem";
import eventEmitter from "@/libs/utils/eventEmitter";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";

dayjs.extend(relativeTime);
dayjs.locale("ko");

// type RootStackParamList = {
//     AcceptedScreen: { notificationId: number };
//     home: undefined;
// };

// type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// const navigation = useNavigation<NavigationProp>();

const Notification = () => {
    const router = useRouter();
    // const navigation = useNavigation();
    const [notifications, setNotifications] = useState<api.Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<api.User | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            await fetchNotifications();
            await fetchCurrentUser();
            setLoading(false); // 모든 데이터가 로드된 후 로딩 상태 해제
        };

        fetchData();
    }, []);

    // 현재 로그인한 유저 정보 불러오기
    const fetchCurrentUser = async () => {
        try {
            const currentUser = await fetchCurrentUserAPI();
            setCurrentUser(currentUser);
        } catch (error) {
            console.error("Failed to fetch current user", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const notificationList = await fetchNotificationsAPI();
            setNotifications(notificationList);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (is_read: boolean, id: number) => {
        if (is_read) {
            return;
        }

        try {
            const newNotification = await updateNotificationAPI(
                { is_read: true },
                id
            );
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === id
                        ? { ...notification, ...newNotification }
                        : notification
                )
            );
            eventEmitter.emit("notificationRead");
        } catch (error) {
            console.error("Failed to update notification", error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await deleteNotificationAPI(id);
            setNotifications((prevNotifications) =>
                prevNotifications.filter(
                    (notification) => notification.id !== id
                )
            );
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    // // 알림 클릭 시 notification_type에 따라 다른 화면으로 이동
    // const handleNotificationPress = (notification: api.Notification) => {
    //     markAsRead(notification.is_read, notification.id);

    //     switch (notification.notification_type) {
    //         case "invitation_register":
    //         case "friend_accept":
    //             if (notification.related_user_id) {
    //                 router.push(`/profiles/${notification.related_user_id}/project`);
    //             } else {
    //                 console.warn("related_user_id is missing, redirecting to home");
    //                 router.push("/");
    //             }
    //             break;
    //         case "invitation_expired":
    //             router.push(`/invite`);
    //             break;
    //         case "friend_reject":
    //         case "project_card_reject":
    //             break;
    //         case "friend_request":
    //             router.push("/myfriends");
    //             break;
    //         case "project_card_invite":
    //         case "project_card_accept":
    //         case "project_card_update":
    //             router.push("/myprofile/project")
    //             break;
    //         case "project_card_recommend":
    //             if (notification.related_project_card_id) {
    //                 router.push(`/project/${notification.related_project_card_id}`);
    //             } else {
    //                 console.warn("related_project_card_id is missing, redirecting to home");
    //                 router.push("/");
    //             }
    //             break;
    //         case "post_create_team":
    //         case "post_update_team":
    //         case "post_create_save":
    //         case "post_update_save":
    //         case "post_like":
    //         case "comment_create":
    //         case "comment_child_create":
    //         case "comment_update":
    //         case "comment_child_update":
    //             if (notification.related_post_id) {
    //                 router.push(`/posts/${notification.related_post_id}`);
    //             } else {
    //                 console.warn("related_post_id is missing, redirecting to home");
    //                 router.push("/");
    //             }
    //             break;
    //         case "new_message":
    //             if (notification.related_conversation_id) {
    //                 router.push(`/conversations/${notification.related_conversation_id}`);
    //             } else {
    //                 console.warn("related_conversation_id is missing, redirecting to home");
    //                 router.push("/");
    //             }
    //             break;
    //         default:
    //             // navigation.navigate("home");
    //             router.push("/");
    //             break;
    //     }
    // };

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color="#0000ff"
                style={styles.loader}
            />
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader title="알림" />
            <View style={[sharedStyles.container, styles.container]}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        // <TouchableOpacity onPress={() => handleNotificationPress(item)}>
                        <TouchableOpacity>
                            <NotificationItem
                                item={item}
                                markAsRead={markAsRead}
                                deleteNotification={deleteNotification}
                            />
                        </TouchableOpacity>
                    )}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingTop: 20,
        paddingHorizontal: 0,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default Notification;
