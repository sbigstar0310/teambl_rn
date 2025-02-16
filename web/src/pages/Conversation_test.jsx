import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/Conversation_test.css";

function Conversation_test() {
  const BASE_URL = "http://localhost:8000";
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState(null); // 이미지 파일 상태 추가
  const [userId] = useState(localStorage.getItem("userId"));

  const fetchConversations = async () => {
    try {
      const response = await api.get("/api/conversations/");

      const conversationsWithLastMessages = await Promise.all(
        response.data.map(async (conversation) => {
          const lastMessageResponse = await api.get(
            `/api/conversations/${conversation.id}/messages/`
          );
          const allMessages = [
            ...lastMessageResponse.data.user1_messages,
            ...lastMessageResponse.data.user2_messages,
            ...lastMessageResponse.data.system_messages,
          ];

          const lastMessage = allMessages.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )[0];

          const hasUnread = allMessages.some(
            (msg) => msg.is_read === false && msg.sender !== parseInt(userId)
          );

          return {
            ...conversation,
            lastMessage,
            hasUnread,
          };
        })
      );

      conversationsWithLastMessages.sort(
        (a, b) =>
          new Date(b.lastMessage?.created_at || 0) -
          new Date(a.lastMessage?.created_at || 0)
      );

      setConversations(conversationsWithLastMessages);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setConversations([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/api/conversations/${conversationId}/messages/`);
      const allMessages = [
        ...response.data.user1_messages.map((msg) => ({
          ...msg,
          image_url: msg.image ? `${BASE_URL}${msg.image}` : null,
        })),
        ...response.data.user2_messages.map((msg) => ({
          ...msg,
          image_url: msg.image ? `${BASE_URL}${msg.image}` : null,
        })),
        ...response.data.system_messages.map((msg) => ({
          ...msg,
          image_url: msg.image ? `${BASE_URL}${msg.image}` : null,
        })),
      ];
  
      allMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
      // 중복 메시지 제거
      const uniqueMessages = Array.from(new Map(allMessages.map((msg) => [msg.id, msg])).values());
  
      setMessages(uniqueMessages);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await api.patch(`/api/conversations/${conversationId}/read/`);
      fetchConversations();
      console.log("Conversation is read", conversationId);
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  };

  const handleConversationClick = (conversationId) => {
    fetchMessages(conversationId);
    markAsRead(conversationId);
  };

  const createConversation = async (recipientId) => {
    if (!recipientId || recipientId.trim() === "") {
      console.error("Invalid recipientId:", recipientId);
      return;
    }

    try {
      await api.post("/api/conversations/create/", { user_2: recipientId });
      fetchConversations();
    } catch (error) {
      console.error("Failed to create conversation:", error.response?.data || error.message);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && !imageFile)) {
      console.error("Message or image is required to send.");
      return;
    }

    const formData = new FormData();
    if (newMessage.trim()) {
      formData.append("message", newMessage.trim());
    }
    if (imageFile) {
      formData.append("image", imageFile); // 이미지 파일 추가
    }

    try {
      await api.post(`/api/messages/${selectedConversation}/create/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setNewMessage("");
      setImageFile(null); // 이미지 초기화
      fetchMessages(selectedConversation);
    } catch (error) {
      console.error("Failed to send message:", error.response?.data || error.message);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.patch(`/api/messages/${messageId}/delete/`);
      fetchMessages(selectedConversation);
    } catch (error) {
      console.error("Failed to delete message:", error.response?.data || error.message);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await api.delete(`/api/conversations/${conversationId}/delete/`);
      fetchConversations();
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  console.log("messages:", messages);

  return (
    <div className="conversation-container">
      <div className="conversation-list">
        <h2>Conversations</h2>
        <ul>
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              className={`conversation-item ${
                selectedConversation === conversation.id
                  ? "conversation-item-active"
                  : conversation.hasUnread
                  ? "conversation-item-unread"
                  : "conversation-item-read"
              }`}
            >
              <div onClick={() => handleConversationClick(conversation.id)}>
                <div>
                  Conversation with{" "}
                  {conversation.user_1 === userId ? conversation.user_2 : conversation.user_1}
                </div>
                {conversation.lastMessage && (
                  <div className="conversation-last-message">
                    {conversation.lastMessage.message}
                  </div>
                )}
                {conversation.hasUnread && <span className="unread-indicator">●</span>}
              </div>
              <button
                className="conversation-delete-button"
                onClick={() => deleteConversation(conversation.id)}
              >
                Delete Conversation
              </button>
            </li>
          ))}
        </ul>
        <button
          className="conversation-add-button"
          onClick={() => {
            const recipientId = prompt("Enter the recipient's user ID:");
            if (recipientId) createConversation(recipientId);
          }}
        >
          Add Conversation
        </button>
      </div>
      <div className="conversation-messages">
        {selectedConversation ? (
          <>
            <h2>Messages</h2>
            <div className="conversation-message-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`conversation-message-item ${
                    message.is_system
                      ? "conversation-message-system"
                      : message.sender === parseInt(userId)
                      ? "conversation-message-user1"
                      : "conversation-message-user2"
                  }`}
                >
                  {message.message && <div className="message-content">{message.message}</div>}
                  {message.image_url && (
                    <img
                      src={message.image_url}
                      alt="Sent"
                      className="message-image"
                    />
                  )}
                  <div className="message-timestamp">
                    {new Date(message.created_at).toLocaleString()}
                  </div>
                  {message.sender === parseInt(userId) && (
                    <button
                      className="conversation-delete-message"
                      onClick={() => deleteMessage(message.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="conversation-message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])} // 이미지 파일 저장
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>Select a conversation to view messages</p>
        )}
      </div>
    </div>
  );
}

export default Conversation_test;