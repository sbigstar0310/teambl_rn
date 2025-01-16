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
    };

    type User = {
        id: number;
        email: string;
        password: string;
        last_login?: Date;
        is_superuser: boolean;
        is_staff: boolean;
        is_active: boolean;
        date_joined: Date;
    };
    type Skill = {
        id: number;
        skill: string;
    };

    type Profile = {
        user_name: string;
        school: string;
        current_academic_degree: string;
        year: number;
        major1: string;
        major2?: string;
        one_degree_count: number;
        introduction: string;
        skills: Skill[];
        portfolio_links: string[];
        image?: string;
        keywords: string[];
    };

    type Message = {
        id: number;
        conversation: number;
        sender: number;
        message: string;
        image?: string;
        is_read: boolean;
        is_system: boolean;
        created_at: Date;
    };

    type NotificationItem = {
        id: number;
        message: string;
        read: boolean;
        createdAt: Date;
    };

    type ProjectCard = {
        id: number;
        title: string;
        keywords: string[];
        accepted_users: User[];
        bookmarked_users: User[];
        creator: User;
        created_at: Date;
        start_date?: Date;
        end_date?: Date;
        description: string;
        posts: Post[];
    };

    type Post = {
        id: number;
        project_card_id: number;
        user: User;
        title: string;
        content: string;
        created_at: Date;
        keywords: string[];
        like_count: number;
        tagged_users: User[];
        contact: string;
        liked_users: User[];
    };
}
