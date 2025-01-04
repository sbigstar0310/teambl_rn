declare module api {
    /**
     * IMPORTANT NOTE:
     * The types below are not fully accurate with the data on the backend.
     * They're made as close as possible to recent structure of the data retrieved from backend
     * for the sake of implementing user interface with mock data first.
     * Please verify the types with backend later on and adjust the needed ones.
     */

    type Conversation = {
        id: number;
        user_1: number;
        user_1_username: string;
        user_2: number;
        user_2_username: string;
        other_user_profile: Profile;
        deleted_for_user1: boolean;
        deleted_for_user2: boolean;
        created_at: Date;
        updated_at: Date;
    }

    type Profile = {
        user_name: string;
        school: string;
        current_academic_degree: string;
        year: number;
        major1: string;
        major2?: string;
        introduction: string;
        image?: string;
        keywords: string[];
    }

    type Message = {
        id: number;
        conversation: number;
        sender: number;
        message: string;
        image?: string;
        is_read: boolean;
        is_system: boolean;
        created_at: Date;
    }

    type NotificationItem = {
        id: number;
        message: string;
        read: boolean;
        createdAt: Date;
    };
}