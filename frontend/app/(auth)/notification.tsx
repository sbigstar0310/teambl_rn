import React, {useEffect} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {timeAgo} from "@/shared/utils";
import {mockNotificationItem1, mockNotificationItem2} from "@/shared/mock-data";
import ScreenHeader from "@/components/common/ScreenHeader";
import {sharedStyles} from "@/app/_layout";

const mockNotifications: api.NotificationItem[] = [
    mockNotificationItem1,
    mockNotificationItem2
];

export default function Notification() {
    const [notifications, setNotifications] = React.useState<api.NotificationItem[]>([]);

    useEffect(() => {
        //     TODO: fetch notifications from api
        setNotifications(mockNotifications);
    }, []);

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader/>
            <View style={sharedStyles.horizontalPadding}>
                <Text style={styles.header}>알림</Text>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <View style={[styles.notification, item.read ? styles.read : styles.unread]}>
                            <TouchableOpacity style={styles.deleteButton}>
                                <Text style={styles.deleteText}>×</Text>
                            </TouchableOpacity>
                            <View style={styles.notificationHeader}>
                                <Text style={styles.message}>{item.message}</Text>
                            </View>
                            <Text style={styles.createdAt}>{timeAgo(item.createdAt)}</Text>
                        </View>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        fontFamily: 'Pretendard',
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        letterSpacing: -0.019,
        color: '#121212',
        marginBottom: 20,
    },
    notification: {
        flexDirection: 'column',
        padding: 15,
        borderBottomWidth: 0.7,
        borderBottomColor: '#ddd',
        marginBottom: 0,
        position: 'relative',
        justifyContent: 'center',
    },
    read: {
        backgroundColor: '#f5f5f5',
    },
    unread: {
        backgroundColor: '#eef4ff',
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    message: {
        fontFamily: 'Pretendard',
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16.71,
        color: '#121212',
        maxWidth: '80%',
        flexWrap: 'wrap',
    },
    deleteButton: {
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 5,
        right: 5,
    },
    deleteText: {
        fontSize: 22,
        lineHeight: 22,
        color: '#A8A8A8',
    },
    createdAt: {
        fontSize: 12,
        color: '#595959',
        position: 'absolute',
        right: 10,
        bottom: 10,
    },
});