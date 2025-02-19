import api from "../../api.js";

/**
 * Retrieve current authenticated user
 * @returns {Promise<User>}
 */
async function getMe() {
    try {
        const response = await api.get("/api/user/current/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch current user", error);
    }
}

/**
 * Search for users by their name
 * @param {string} query
 * @returns {Promise<{ user: User, connectionLevel: number }[]>}
 */
async function searchUsers(query) {
    try {
        const response = await api.get(`/api/search/name/`, {
            params: {user_name: query}
        });
        if (response.data?.profiles) {
            const profiles = response.data.profiles;
            const userIds = response.data.user_id_list;
            const oneDegreeConnectionList = response.data.one_degree_distacne_list;
            const results = [];
            for (let i = 0; i < userIds.length; i++) {
                const connectionLevel = oneDegreeConnectionList.includes(userIds[i]) ? 1 : 0;
                results.push({
                    user: {
                        id: userIds[i],
                        profile: profiles[i]
                    }, connectionLevel
                })
            }
            return results;
        } else {
            return []
        }
    } catch (error) {
        console.error("Failed to get user", error);
    }
}

/**
 * Create a new conversation with the specified user
 * @param {number} otherUserId
 * @returns {Promise<Conversation>}
 */
async function createConversation(otherUserId) {
    try {
        const response = await api.post(`/api/conversation/conversations/create/`, {user_2: otherUserId});
        return response.data;
    } catch (error) {
        console.error("Failed to create a new chat", error);
    }
}

/**
 * Retrieve list of all conversations
 * @returns {Promise<Conversation[]>}
 */
async function getConversations() {
    try {
        const response = await api.get("/api/conversation/conversations/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch list of conversations", error);
    }
}

/**
 * Delete a specified conversation
 * @param {number} conversationId
 * @returns {Promise<void>}
 */
async function deleteConversation(conversationId) {
    try {
        await api.delete(`/api/conversation/conversations/${conversationId}/delete/`);
    } catch (error) {
        console.error("Failed to delete a conversation", error);
    }
}

/**
 * Retrieve list of all messages in a conversation
 * @param {number} conversationId
 * @returns {Promise<Message[]>}
 */
async function getMessages(conversationId) {
    try {
        const response = await api.get(`/api/conversation/conversations/${conversationId}/messages/`);
        const systemMessages = response.data.system_messages ?? [];
        const user1Messages = response.data.user1_messages ?? [];
        const user2Messages = response.data.user2_messages ?? [];
        return [...systemMessages, ...user1Messages, ...user2Messages];
    } catch (error) {
        console.error("Failed to fetch list of messages", error);
    }
}

/**
 * Get the latest message in the chat
 * @param {number} conversationId
 * @returns {Promise<Message>}
 */
async function getLatestMessage(conversationId) {
    try {
        const response = await api.get(`/api/conversation/conversations/${conversationId}/last-message/`);
        return response.data?.last_message;
    } catch (error) {
        console.error("Failed to fetch latest message", error);
    }
}

/**
 * Create a new message in the chat
 * @param {number} conversationId
 * @param {string} [message]
 * @param {File} [image]
 * @returns {Promise<Message>}
 */
async function createMessage(conversationId, {message, image}) {
    try {
        const formData = new FormData();
        if (message) {
            formData.append("message", message);
        }
        if (image) {
            formData.append("image", image);
        }
        const response = await api.post(`/api/conversation/messages/${conversationId}/create/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to create a new message", error);
    }
}

/**
 * Delete message with specified id
 * @param {number} messageId
 * @returns {Promise<void>}
 */
async function deleteMessage(messageId) {
    try {
        await api.patch(`/api/conversation/messages/${messageId}/delete/`);
    } catch (error) {
        console.error("Failed to delete a message", error);
    }
}

/**
 * Mark all the unread messages in a specified conversation
 * @param {number} conversationId
 * @returns {Promise<void>}
 */
async function markAsRead(conversationId) {
    try {
        await api.patch(`/api/conversation/conversations/${conversationId}/read/`);
    } catch (error) {
        console.error("Failed to mark messages as read", error);
    }
}

const conversationsApi = {
    getMe,
    searchUsers,
    createConversation,
    getConversations,
    deleteConversation,
    getLatestMessage,
    getMessages,
    createMessage,
    deleteMessage,
    markAsRead
};

export default conversationsApi;

/**
 * Skill object
 * @typedef {Object} Skill
 * @property {number} id - id of the skill
 * @property {string} skill - title of the skill
 * @example
 * {
 *    id: 1,
 *    skill: "figma"
 * }
 */

/**
 * Profile object
 * @typedef {Object} Profile
 * @property {string} user_name
 * @property {string} school
 * @property {string} current_academic_degree
 * @property {number} year
 * @property {string} major1
 * @property {string | null} major2
 * @property {number} one_degree_count
 * @property {string} introduction
 * @property {Skill[]} skills
 * @property {Array} portfolio_links
 * @property {null} image
 * @property {string[]} keywords
 * @example
 * {
 *     user_name: "유저1",
 *     school: "카이스트",
 *     current_academic_degree: "학사",
 *     year: 2020,
 *     major1: "전산학부",
 *     major2: null,
 *     one_degree_count: 1,
 *     introduction: "",
 *     skills: [
 *         {
 *             "id": 1,
 *             "skill": "figma"
 *         }
 *     ],
 *     portfolio_links: [],
 *     image: null,
 *     keywords: [
 *         "테스트1",
 *         "테스트2"
 *     ]
 * }
 */

/**
 * User object
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} user_name
 * @property {Date | null} last_login
 * @property {boolean} is_superuser
 * @property {boolean} is_staff
 * @property {boolean} is_active
 * @property {Date} date_joined
 * @property {Profile} profile
 * @example
 * {
 *     id: 1,
 *     email: "testuser01@kaist.ac.kr",
 *     user_name: "유저1",
 *     last_login: null,
 *     is_superuser: false,
 *     is_staff: false,
 *     is_active: true,
 *     date_joined: "2024-11-30T20:40:56.881003+09:00",
 *     profile: {
 *         user_name: "유저1",
 *         school: "카이스트",
 *         current_academic_degree: "학사",
 *         year: 2020,
 *         major1: "전산학부",
 *         major2: null,
 *         one_degree_count: 1,
 *         introduction: "",
 *         skills: [
 *             {
 *                 "id": 1,
 *                 "skill": "figma"
 *             }
 *         ],
 *         portfolio_links: [],
 *         image: null,
 *         keywords: [
 *             "테스트1",
 *             "테스트2"
 *         ]
 *     }
 * }
 */

/**
 * Conversation object
 * @typedef {Object} Conversation
 * @property {number} id
 * @property {number} user_1 - id of the user 1 in the conversation
 * @property {string} user_1_username - username of the user 1
 * @property {number} user_2 - id of the user 2 in the conversation
 * @property {string} user_2_username - username of the user 2
 * @property {Profile} other_user_profile - profile of the other user in the conversation
 * @property {boolean} deleted_for_user1 - Whether the conversation has been deleted for user 1
 * @property {boolean} deleted_for_user2 - Whether the conversation has been deleted for user 2
 * @property {Date} created_at - Conversation creation date
 * @property {Date} updated_at - Conversation last update date
 * @example
 * {
 *     id: 2,
 *     user_1: 1,
 *     user_1_username: "유저1",
 *     user_2: 2,
 *     user_2_username: "유저2",
 *     deleted_for_user1: false,
 *     deleted_for_user2: false,
 *     created_at: "2024-12-08T16:02:05.224851+09:00",
 *     updated_at: "2024-12-08T16:02:05.224885+09:00"
 * }
 */

/**
 * Message object
 * @typedef {Object} Message
 * @property {number} id
 * @property {number} conversation - id of the conversation the message belongs to
 * @property {number} sender - id of the user who sent the message
 * @property {string} message - text content of the message
 * @property {string | null} image - path to image file if message contains image
 * @property {boolean} is_read - whether the other user has read the message or not
 * @property {boolean} is_system - whether the message was sent by the system or not
 * @property {string | null} image_url - same as 'image'
 * @property {Date} created_at - Datetime the message was sent att
 * @example
 * {
 *     id: 2,
 *     conversation: 2,
 *     sender: 1,
 *     message: "삭제된 메시지입니다.",
 *     image: "/media/message_images/photo_2024-06-06_23-33-20_ElZPm3P.jpg",
 *     is_read: false,
 *     is_system: false,
 *     image_url: "/media/message_images/photo_2024-06-06_23-33-20_ElZPm3P.jpg",
 *     created_at: "2024-12-08T16:04:52.405861+09:00"
 * }
 */