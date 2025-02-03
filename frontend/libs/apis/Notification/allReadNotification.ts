import api from "@/shared/api";

/**
 * Marks all notifications as read.
 * @returns A Promise resolving when the operation is complete.
 */
const allReadNotification = async (): Promise<void> => {
    try {
        await api.post("notification/all-read/");
        console.log("All notifications marked as read.");
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
        throw error;
    }
};

export default allReadNotification;