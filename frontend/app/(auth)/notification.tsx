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
import { useNavigation } from "@react-navigation/native";
import healthCheck from "@/libs/apis/healthCheck";
import fetchNotificationsAPI from "@/libs/apis/fetchNotifications";
import updateNotificationAPI from "@/libs/apis/updateNotification";
import deleteNotificationAPI from "@/libs/apis/deleteNotification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko"; // 한국어 로케일 사용
import ScreenHeader from "@/components/common/ScreenHeader";
import { sharedStyles } from "../_layout";
import NotificationItem from "@/components/NotificationItem";

dayjs.extend(relativeTime);
dayjs.locale("ko");

const Notification = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<api.Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealthStatus();
        fetchNotifications();
    }, []);

    const fetchHealthStatus = async () => {
        try {
            const status = await healthCheck();
            console.log("API Response:", status);
        } catch (error) {
            console.error("Failed to fetch health status", error);
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
        // check notification is already read
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
                        <NotificationItem
                            item={item}
                            markAsRead={markAsRead}
                            deleteNotification={deleteNotification}
                        />
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
    header: {
        fontSize: 20,
        fontWeight: "600",
        color: "#121212",
        marginBottom: 20,
    },
    notification: {
        padding: 15,
        borderBottomWidth: 0.7,
        borderBottomColor: "#ddd",
    },
    read: {
        backgroundColor: "#f5f5f5",
    },
    unread: {
        backgroundColor: "#eef4ff",
    },
    notificationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    message: {
        fontSize: 12,
        color: "#121212",
    },
    deleteText: {
        fontSize: 22,
        color: "#A8A8A8",
    },
    createdAt: {
        fontSize: 12,
        color: "#595959",
        marginTop: 5,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default Notification;
