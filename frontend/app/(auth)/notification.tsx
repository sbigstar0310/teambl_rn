import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import api from "../../shared/api";

// 알림 타입 정의
type NotificationType = {
    id: number;
    message: string;
    read: boolean;
    createdAt: string;
};

const Notification = ({ updateUnreadCount }: { updateUnreadCount: (count: number) => void }) => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
        fetchHealthStatus();
    }, []);

    const fetchHealthStatus = async () => {
        try {
            const response = await api.get(`http://192.168.138.85:8000/api/health-check/`);
            console.log("API Response:", response.data);
        } catch (error) {
            console.error("Failed to fetch health status", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await api.get("http://192.168.138.85:8000/api/notifications/");
            setNotifications(response.data);
            updateUnreadCount(response.data.filter((notif: NotificationType) => !notif.read).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }

    };

    const updateNotification = async ({ id, isReadButtonClicked = false }: { id: number; isReadButtonClicked?: boolean }) => {
        try {
            const newData = isReadButtonClicked ? { read: true } : {};
            const response = await api.patch(`http://192.168.138.85:8000/api/notifications/update/${id}/`, newData);

            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === id ? { ...notification, ...response.data } : notification
                )
            );

            if (isReadButtonClicked) {
                updateUnreadCount(
                    notifications.reduce((count, notification) => count + (!notification.read && notification.id !== id ? 1 : 0), 0)
                );
            }
        } catch (error) {
            console.error("Failed to update notification", error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await api.delete(`http://192.168.138.85:8000/api/notifications/delete/${id}/`);
            setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const timeAgo = (timestamp: string) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / 60000);

        if (diffInMinutes < 1) return "방금 전";
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
        return `${Math.floor(diffInMinutes / 1440)}일 전`;
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <Text style={styles.header}>알림</Text>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.notification, item.read ? styles.read : styles.unread]}
                            onPress={() => updateNotification({ id: item.id, isReadButtonClicked: true })}
                        >
                            <View style={styles.notificationHeader}>
                                <Text style={styles.message}>{item.message}</Text>
                                <TouchableOpacity onPress={() => deleteNotification(item.id)}>
                                    <Text style={styles.deleteText}>×</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.createdAt}>{timeAgo(item.createdAt)}</Text>
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
        padding: 20,
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
