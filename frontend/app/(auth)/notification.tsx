import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

type NotificationItem = {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
};

type NotificationProps = {};

const timeAgo = (timestamp: string): string => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / 60000);

  if (diffInMinutes < 1) return "방금 전";
  if (diffInMinutes === 1) return "1분 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return "1시간 전";
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "1일 전";
  if (diffInDays < 30) return `${diffInDays}일 전`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return "1달 전";
  return `${diffInMonths}달 전`;
};

const notifications: NotificationItem[] = [
  { id: 1, message: '새로운 알림이 도착했습니다.', createdAt: '2024-12-01T12:00:00Z', read: false },
  { id: 2, message: '알림 내용을 확인하세요.', createdAt: '2025-01-01T11:00:00Z', read: true },
];

const Notification: React.FC<NotificationProps> = () => {
  
  const navigation = useNavigation();

  const handleBackButton = () => {
    navigation.goBack();
  };
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
            <Image source={require('../../assets/left-arrow.png')} style={styles.backIcon} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.header}>알림</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.019,
    color: '#121212',
    marginBottom: 20,
  },
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  backButton: {
    width: 20,
    backgroundColor: 'transparent',
  },
  backIcon: {
    width: 20,
    height: 16,
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

export default Notification;



// import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
// import api from '../../api';

// type NotificationItem = {
//   id: number;
//   message: string;
//   createdAt: string;
//   read: boolean;
// };

// type NotificationProps = {
//   updateUnreadCount: (count: number) => void;
// };

// const timeAgo = (timestamp: string): string => {
//   const now = new Date();
//   const notificationTime = new Date(timestamp);
//   const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / 60000);

//   if (diffInMinutes < 1) return "방금 전";
//   if (diffInMinutes === 1) return "1분 전";
//   if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

//   const diffInHours = Math.floor(diffInMinutes / 60);
//   if (diffInHours === 1) return "1시간 전";
//   if (diffInHours < 24) return `${diffInHours}시간 전`;

//   const diffInDays = Math.floor(diffInHours / 24);
//   if (diffInDays === 1) return "1일 전";
//   if (diffInDays < 30) return `${diffInDays}일 전`;

//   const diffInMonths = Math.floor(diffInDays / 30);
//   if (diffInMonths === 1) return "1달 전";
//   return `${diffInMonths}달 전`;
// };

// const Notification: React.FC<NotificationProps> = ({ updateUnreadCount }) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     try {
//       const response = await api.get('/api/notifications/');
//       setNotifications(response.data);
//       updateUnreadCount(response.data.filter((notif: NotificationItem) => !notif.read).length);
//     } catch (error) {
//       console.error('Failed to fetch notifications', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update notification
//   const updateNotification = async ({ id, isReadButtonClicked = false }: { id: number; isReadButtonClicked?: boolean }) => {
//     try {
//       const newData = isReadButtonClicked ? { read: true } : {};

//       const response = await api.patch(`/api/notifications/update/${id}/`, newData);

//       setNotifications((prevNotifications) =>
//         prevNotifications.map((notification) =>
//           notification.id === id ? { ...notification, ...response.data } : notification
//         )
//       );

//       if (isReadButtonClicked) {
//         updateUnreadCount(
//           notifications.reduce((count, notification) => count + (!notification.read && notification.id !== id ? 1 : 0), 0)
//         );
//       }
//     } catch (error) {
//       console.error('Failed to update notification', error);
//     }
//   };

//   // Delete notification
//   const deleteNotification = async (id: number) => {
//     try {
//       await api.delete(`/api/notifications/delete/${id}/`);
//       setNotifications((prevNotifications) =>
//         prevNotifications.filter((notification) => notification.id !== id)
//       );
//       updateUnreadCount(
//         notifications.reduce((count, notification) => count + (!notification.read && notification.id !== id ? 1 : 0), 0)
//       );
//     } catch (error) {
//       console.error('Failed to delete notification', error);
//     }
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>알림</Text>
//       <FlatList
//         data={notifications}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={[styles.notification, item.read ? styles.read : styles.unread]}>
//             <TouchableOpacity style={styles.deleteButton} onPress={() => deleteNotification(item.id)}>
//               <Text style={styles.deleteText}>×</Text>
//             </TouchableOpacity>
//             <View style={styles.notificationHeader}>
//               <Text style={styles.message}>{item.message}</Text>
//             </View>
//             <Text style={styles.createdAt}>{timeAgo(item.createdAt)}</Text>
//             {!item.read && (
//               <TouchableOpacity
//                 style={styles.markReadButton}
//                 onPress={() => updateNotification({ id: item.id, isReadButtonClicked: true })}
//               >
//                 <Text style={styles.markReadText}>읽음</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     padding: 20,
//   },
//   header: {
//     fontFamily: 'Pretendard',
//     fontSize: 20,
//     fontWeight: '600',
//     lineHeight: 28,
//     letterSpacing: -0.019,
//     color: '#121212',
//     marginBottom: 20,
//   },
//   notification: {
//     flexDirection: 'column',
//     padding: 15,
//     borderBottomWidth: 0.7,
//     borderBottomColor: '#ddd',
//     marginBottom: 0,
//     position: 'relative',
//     justifyContent: 'center',
//   },
//   read: {
//     backgroundColor: '#f5f5f5',
//   },
//   unread: {
//     backgroundColor: '#eef4ff',
//   },
//   notificationHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   message: {
//     fontFamily: 'Pretendard',
//     fontSize: 12,
//     fontWeight: '400',
//     lineHeight: 16.71,
//     color: '#121212',
//     maxWidth: '80%',
//     flexWrap: 'wrap',
//   },
//   deleteButton: {
//     width: 22,
//     height: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     top: 5,
//     right: 5,
//   },
//   deleteText: {
//     fontSize: 22,
//     lineHeight: 22,
//     color: '#A8A8A8',
//   },
//   createdAt: {
//     fontSize: 12,
//     color: '#595959',
//     position: 'absolute',
//     right: 10,
//     bottom: 10,
//   },
//   markReadButton: {
//     position: 'absolute',
//     right: 10,
//     top: 10,
//     backgroundColor: '#007bff',
//     padding: 5,
//     borderRadius: 5,
//   },
//   markReadText: {
//     color: '#ffffff',
//     fontSize: 12,
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default Notification;
