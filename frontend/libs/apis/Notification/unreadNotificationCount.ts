import api from "@/shared/api";

// Define the expected response type
interface UnreadNotificationResponse {
    unread_count: number;
}

/**
 * Fetches the count of unread notifications.
 * @returns A Promise resolving to the unread notification count.
 */
const unreadNotificationCount = async (): Promise<UnreadNotificationResponse> => {
    const response = await api.get<UnreadNotificationResponse>("notification/unread-count/");
    return response.data;
};
// const unreadNotificationCount = async (): Promise<UnreadNotificationResponse> => {
//     try {
//         console.log("Fetching unread notifications...");

//         const response = await api.get<UnreadNotificationResponse>("notification/unread-count/");

//         console.log("Response received:", response.data);

//         return response.data;
//     } catch (error) {
//         console.error("Failed to fetch unread notifications:", error);
//         throw error;
//     }
// };


export default unreadNotificationCount;
