declare module api {
    /**
     * IMPORTANT NOTE:
     * The types below are not fully accurate with the data on the backend.
     * They're made as close as possible to recent structure of the data retrieved from backend
     * for the sake of implementing user interface with mock data first.
     * Please verify the types with backend later on and adjust the needed ones.
     */

    type Skill = {
        id: number;
        skill: string;
        profile: Profile;
    };

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
        last_login?: Date;
        is_superuser: boolean;
        is_staff: boolean;
        is_active: boolean;
        date_joined: Date;
        profile: Profile;
    };

    type UserSearchResult = {
        is_new_user: boolean;
        relation_degree: number | null;
        user: User;
    };

    type Profile = {
        user_name: string;
        school: string;
        current_academic_degree: string;
        year: number;
        major1: string;
        major2: string | null;
        one_degree_count: number;
        introduction: string;
        skills: string[];
        portfolio_links: string[];
        image: string | null;
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

    type Notification = {
        id: number;
        user: number;
        message: string;
        created_at: string;
        is_read: boolean;
        notification_type: string;
        related_user_id?: number;
        related_project_card_id?: number;
    };

    type ProjectCard = {
        id: number;
        title: string;
        keywords: string[];
        accepted_users: number[];
        bookmarked_users: number[];
        creator: User;
        created_at: Date;
        start_date?: Date;
        end_date?: Date;
        description: string;
        posts: Post[];
    };

    type Post = {
        id: number;
        project_card: ProjectCard;
        user: User;
        content: string;
        created_at: Date;
        like_count: number;
        tagged_users: User[];
        liked_users: User[];
        images: PostImage[];
        comments: Comment[];
    };

    type Friend = {
        id: number;
        from_user: User;
        to_user: User;
        created_at: Date;
        status: string;
    };

    type Comment = {
        id: number;
        user: number;
        post: number;
        content: string;
        created_at: Date;
        likes: number;
        parent_comment?: number;
    };

    type InvitationLink = {
        id: number;
        inviter: number;
        invitee_name: string;
        invitee_id?: number;
        link: string;
        created_at: Date;
        status: string;
    };

    type Report = {
        id: number;
        user: User; // 신고한 사용자 ID
        content: string; // 신고 내용
        created_at: Date; // 신고 생성 시간
        related_project_card_id?: number | null; // 프로젝트 카드 신고 (선택)
        related_post_id?: number | null; // 게시글 신고 (선택)
        related_comment_id?: number | null; // 댓글 신고 (선택)
        related_user_id?: number | null; // 사용자 신고 (선택)
    };

    type PostImage = {
        id: number;
        image: string;
        created_at: Date;
    };
}
