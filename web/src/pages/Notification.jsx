import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Notification.css";
import backIcon from "../assets/Profile/left-arrow.svg";

const Notification = ({ updateUnreadCount }) => {
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchCurrentUser();
  }, []);

  // 현재 로그인한 유저 정보 불러오기
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/current-user/");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user", error);
    }
  };

  // 알림 목록 불러오기
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/notifications/");
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  // 알림 수정하기
  const updateNotification = async ({ id, isReadButtonClicked = false }) => {
    try {
      const newData = isReadButtonClicked
        ? { is_read: true }
        : { message: editMessage };

      const response = await api.patch(
        `/api/notifications/update/${id}/`,
        newData
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? response.data : notification
        )
      );

      if (!isReadButtonClicked) {
        setEditMessage("");
        setSelectedNotification(null);
      }
      

      // 알림을 읽음으로 표시한 이후, 직접 읽지 않은 알림 개수를 다시 계산하여 부모에게 전달
      const unreadCount = notifications.reduce((count, notification) => {
        if (notification.id === id) {
          // 방금 읽은 알림은 읽음 처리로 가정
          return count;
        }
        return count + (notification.is_read ? 0 : 1);
      }, 0);
      
      updateUnreadCount(unreadCount);
      
    } catch (error) {
      console.error("Failed to update notification", error);
    }
  };

  // 알림 삭제하기
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/delete/${id}/`);
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  // 알림 시간 계산 함수
  const timeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / 60000);
  
    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes === 1) return "1분 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1시간 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
  
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1일 전";
    return `${diffInDays}일 전`;
  };

  const handleNotificationClick = async (notification) => {
    console.log("Notification Clicked: ", notification); // 로그 추가
    
    // 알림을 읽음 상태로 업데이트
    if (!notification.is_read) {
      try {
        await updateNotification({
          id: notification.id,
          isReadButtonClicked: true,
        });
  
        // 여기서 unreadCount를 다시 계산하여 업데이트
        const unreadCount = notifications.filter(n => !n.is_read).length - 1;
        updateUnreadCount(unreadCount);
        
      } catch (error) {
        console.error("Failed to mark notification as read", error);
        return; // 실패했을 경우 페이지 이동을 막습니다.
      }
    }

    switch (notification.notification_type) {
        case 'invitation_register':
            if (notification.related_user_id) {
                console.log("Navigating to profile with ID: ", notification.related_user_id);
                navigate(`/profile/${notification.related_user_id}`);
            } else {
                console.error("No related_user_id found for this notification");
            }
            break;
        case 'invitation_expired':
            navigate("/invite");
            break;
        case 'friend_accept':
            if (notification.related_user_id) {
                console.log("Navigating to profile with ID: ", notification.related_user_id);
                navigate(`/profile/${notification.related_user_id}`);
            } else {
                console.error("No related_user_id found for this notification");
            }
            break;
        case 'friend_request':
            navigate("/friends");
            break;
        case 'project_tag':
            // navigate("/projects");
            if (notification.related_project_id) {
                console.log("Navigating to project with ID: ", notification.related_project_id);
                navigate(`/projects/${notification.related_project_id}`);
            } else {
                console.error("No related_project_id found for this notification");
            }
            break;
        case 'new_comment':
          if (notification.related_project_id) {
              console.log("Navigating to project with ID: ", notification.related_project_id);
              navigate(`/projects/${notification.related_project_id}`);
          } else {
              console.error("No related_project_id found for this notification");
          }
          break;
        case 'reply_comment':
          if (notification.related_project_id) {
              console.log("Navigating to project with ID: ", notification.related_project_id);
              navigate(`/projects/${notification.related_project_id}`);
          } else {
              console.error("No related_project_id found for this notification");
          }
          break;
        case 'project_profile_keyword':
          if (notification.related_project_id) {
              console.log("Navigating to project with ID: ", notification.related_project_id);
              navigate(`/projects/${notification.related_project_id}`);
          } else {
              console.error("No related_project_id found for this notification");
          }
          break;
        case 'experience_request':
          navigate(`/profile/${currentUser.id}`);
          break;
        case 'experience_accept':
          if (notification.related_user_id) {
            console.log("Navigating to profile with ID: ", notification.related_user_id);
            navigate(`/profile/${notification.related_user_id}`);
          } else {
              console.error("No related_user_id found for this notification");
          }
          break;
        case 'experience_reject':
          if (notification.related_user_id) {
            console.log("Navigating to profile with ID: ", notification.related_user_id);
            navigate(`/profile/${notification.related_user_id}`);
          } else {
              console.error("No related_user_id found for this notification");
          }
          break;
        case 'experience_deleted':
          navigate(`/profile/${currentUser.id}`);
          break;
        case 'experience_register':
          if (notification.related_user_id) {
            console.log("Navigating to profile with ID: ", notification.related_user_id);
            navigate(`/profile/${notification.related_user_id}`);
          } else {
              console.error("No related_user_id found for this notification");
          }
          break;
        case 'experience_invitation_deleted': // 특별히 어딘가로 이동할 필요 없다고 판단
          break;
        case 'new_message':
          navigate(`/conversations`);
        default:
          break;
        }
  };

  // 메시지 줄바꿈 처리, 유저이름 굵게 표시하는 함수 (하드코딩)
  const formatMessage = (message) => {
    if (message.includes("을 통해")) {
      const parts = message.split("을 통해 ");
      const experiencePart = parts[0].replace("경험 ", "");
      const userNamePart = parts[1].split("님이 팀블에 가입했습니다.\n");
      const experienceTitle = experiencePart.trim();
      const userName = userNamePart[0].trim();

      return (
          <>
              경험 <strong>{experienceTitle}</strong>을 통해 <strong>{userName}</strong>님이 팀블에 가입했습니다.
              <br />
              <span><strong>{userName}</strong>님의 프로필을 지금 확인해보세요!</span>
          </>
      );
    } else if (message.includes("님이 팀블에 가입했습니다.")) {
      const parts = message.split("님이 팀블에 가입했습니다.\n");
      const userName = parts[0].replace("내가 초대한 ", "");
      return (
        <>
          내가 초대한 <strong>{userName}</strong>님이 팀블에 가입했습니다.
          <br />
          <span><strong>{userName}</strong>님의 프로필을 지금 확인해보세요!</span>
        </>
      );
    } else if (message.includes("님의 초대 링크가 만료됐습니다.")) {
      const parts = message.split("님의 초대 링크가 만료됐습니다.\n");
      const userName = parts[0].replace("내가 초대한 ", "");
      return (
        <>
          내가 초대한 <strong>{userName}</strong>님의 초대 링크가 만료됐습니다.
          <br />
          <span>초대 링크를 다시 생성해주세요!</span>
        </>
      );
    } else if (message.includes("일촌 신청을 수락")) {
      const parts = message.split("님이 일촌 신청을 수락했습니다.\n");
      return (
        <>
          <strong>{parts[0]}</strong>님이 일촌 신청을 수락했습니다.
          <br />
          <span><strong>{parts[0]}</strong>님의 프로필을 확인해보세요!</span>
        </>
      );
    } else if (message.includes("일촌 신청이 도착")) {
      const parts = message.split("님의 일촌 신청이 도착했습니다.\n");
      return (
        <>
          <strong>{parts[0]}</strong>님의 일촌 신청이 도착했습니다.
          <br />
          <span>일촌 리스트에서 확인해보세요!</span>
        </>
      );
    } else if (message.includes("일촌 신청을 거절")) {
      const parts = message.split("님이 일촌 신청을 거절했습니다.");
      return (
        <>
          <strong>{parts[0]}</strong>님이 일촌 신청을 거절했습니다.
        </>
      );
    } else if (message.includes("게시물에 태그")) {
      const parts = message.split("님이 당신을 ");
      const secondPart = parts[1].split(" 게시물에 태그했습니다.");
      return (
          <>
            <strong>{parts[0]}</strong>님이 당신을 <strong>"{secondPart[0]}"</strong> 게시물에 태그했습니다.
          </>
      );
    } else if (message.includes("새로운 댓글")) {
      const parts = message.split("님이 '");
      const secondPart = parts[1].split("' 게시물에 새로운 댓글을 작성했습니다.");
      return (
        <>
          <strong>{parts[0]}</strong>님이 <strong>"{secondPart[0]}"</strong> 게시물에 새로운 댓글을 작성했습니다.
        </>
      );
    } else if (message.includes("답글을 남겼습니다")) {
      const parts = message.split("님이 '");
      const secondPart = parts[1].split("' 게시물의 당신의 댓글에 답글을 남겼습니다.");
      return (
        <>
          <strong>{parts[0]}</strong>님이 <strong>"{secondPart[0]}"</strong> 게시물의 당신의 댓글에 답글을 남겼습니다.
        </>
      );
    } else if (message.includes("흥미로워 할만한")) {
      const parts = message.split("흥미로워 할만한 ");
      const secondPart = parts[1].split(" 게시물을 추천해드려요.");
      return (
        <>
          당신이 흥미로워 할만한 <strong>"{secondPart[0]}"</strong> 게시물을 추천해드려요.
        </>
      );
    } else if (message.includes("에 당신을 태그했습니다")) {
      const parts = message.split("님이 경험 ");
      const secondPart = parts[1].split("에 당신을 태그했습니다.");
      return (
        <>
          <strong>{parts[0]}</strong>님이 경험 <strong>"{secondPart[0]}"</strong>에 당신을 태그했습니다.
        </>
      );
    } else if (message.includes("참여 요청을 수락")) {
      const parts = message.split("님이 경험 ");
      const secondPart = parts[1].split("의 참여 요청을 수락했습니다.");
      return (
        <>
          <strong>{parts[0]}</strong>님이 경험 <strong>"{secondPart[0]}"</strong>의 참여 요청을 수락했습니다.
        </>
      );
    } else if (message.includes("참여 요청을 거절")) {
      const parts = message.split("님이 경험 ");
      const secondPart = parts[1].split("의 참여 요청을 거절했습니다.");
      return (
        <>
          <strong>{parts[0]}</strong>님이 경험 <strong>"{secondPart[0]}"</strong>의 참여 요청을 거절했습니다.
        </>
      );
    } else if (message.includes("멤버에서 제외")) {
      const parts = message.split("의 멤버에서 제외되었습니다.");
      const secondPart = parts[0].split("당신이 경험 ");
      return (
        <>
          당신이 경험 "<strong>{secondPart[1]}</strong>"의 멤버에서 제외됐습니다.
        </>
      );
    } else if (message.includes("메시지를 보냈습니다")) {
      const parts = message.split("님이 당신에게 메시지를 보냈습니다: ");
      return (
        <>
          <strong>{parts[0]}</strong>님이 당신에게 메시지를 보냈습니다: "<strong>{parts[1]}</strong>"
        </>
      );
    } else if (message.includes("태그가 취소되었습니다")) {
      const parts = message.split("의 태그가 취소되었습니다.");
      const [inviterPart, experiencePart] = parts[0].split("님이 보낸 경험 ");
      return (
        <>
          <strong>{inviterPart}</strong>님이 보낸 경험 "<strong>{experiencePart}</strong>"의 태그가 취소되었습니다.
        </>
      );
    } else {
      return <>{message}</>;
    }
  };
  
  return (
    <div className="notification-container">
      <div className="notification-back">
        <button
          type="button"
          className="notification-backbutton"
          onClick={() => window.history.back()}
        >
          <img src={backIcon}></img>
        </button>
      </div>
      
      <h1>알림</h1>  
      <div>
        {/* <h2>Notification List</h2> */}
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.is_read ? "read" : "unread"}
              onClick={() => {
                if (!notification.is_read) {
                    updateNotification({
                        id: notification.id,
                        isReadButtonClicked: true,
                    });
                }
                handleNotificationClick(notification);
            }}
            > 
            <div className="notification-header">
              <span className="message">{formatMessage(notification.message)}</span>
                <button
                  className="delete"
                  onClick={(e) => {
                    e.stopPropagation(); // 클릭이 상위 요소로 전파되지 않도록 막음
                    deleteNotification(notification.id);
                  }}
                ></button>
              </div>
              <div className="created-at">{timeAgo(notification.created_at)}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notification;
