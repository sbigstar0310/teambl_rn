const mockProfile1: api.Profile = {
    user_name: "teambluser",
    school: "KAIST",
    current_academic_degree: "Undergraduate",
    year: 2023,
    major1: "Computer Science",
    major2: "Electrical Engineering",
    introduction: "Great guy",
    image: "https://teambl.net/media/profile_images/IMG_2868.jpeg",
    keywords: ["teambl", "user"],
    one_degree_count: 1,
    portfolio_links: [],
    skills: [],
};

export const mockConversation1: api.Conversation = {
    id: 1,
    user_1: 1,
    user_1_username: "teambluser1",
    user_2: 2,
    user_2_username: "teambluser2",
    other_user_profile: mockProfile1,
    deleted_for_user1: false,
    deleted_for_user2: false,
    created_at: new Date("Thu, 02 Jan 2025 11:58:11 GMT"),
    updated_at: new Date("Thu, 02 Jan 2025 11:58:11 GMT"),
};
export const mockConversation2: api.Conversation = {
    id: 2,
    user_1: 1,
    user_1_username: "teambluser1",
    user_2: 2,
    user_2_username: "teambluser2",
    other_user_profile: mockProfile1,
    deleted_for_user1: false,
    deleted_for_user2: false,
    created_at: new Date("Thu, 02 Jan 2025 11:58:11 GMT"),
    updated_at: new Date("Thu, 02 Jan 2025 11:58:11 GMT"),
};
export const mockConversation3: api.Conversation = {
    id: 3,
    user_1: 1,
    user_1_username: "teambluser1",
    user_2: 2,
    user_2_username: "teambluser2",
    other_user_profile: mockProfile1,
    deleted_for_user1: false,
    deleted_for_user2: false,
    created_at: new Date("Thu, 02 Jan 2025 11:58:11 GMT"),
    updated_at: new Date("Thu, 02 Jan 2025 11:58:11 GMT"),
};

export const mockMessage1: api.Message = {
    id: 1,
    conversation: 1,
    sender: 2,
    message: "Hello World!",
    is_read: false,
    is_system: false,
    created_at: new Date("Thu, 02 Jan 2025 11:59:15 GMT"),
};

export const mockUser1: api.User = {
    id: 1,
    email: "test1@kaist.ac.kr",
    last_login: new Date("Thu, 09 Jan 2025 11:59:15 GMT"),
    is_superuser: false,
    is_staff: false,
    is_active: true,
    date_joined: new Date("Thu, 01 Jan 2025 11:59:15 GMT"),
    profile: mockProfile1,
};

export const mockUser2: api.User = {
    id: 2,
    email: "test2@kaist.ac.kr",
    last_login: new Date("Thu, 09 Jan 2025 11:59:15 GMT"),
    is_superuser: false,
    is_staff: false,
    is_active: true,
    date_joined: new Date("Thu, 14 Jan 2025 11:59:15 GMT"),
    profile: mockProfile1,
};

export const mockUser3: api.User = {
    id: 3,
    email: "test3@kaist.ac.kr",
    last_login: new Date("Thu, 09 Jan 2025 11:59:15 GMT"),
    is_superuser: false,
    is_staff: false,
    is_active: true,
    date_joined: new Date("Thu, 11 Jan 2025 11:59:15 GMT"),
    profile: mockProfile1,
};

export const mockProject1: api.ProjectCard = {
    id: 1,
    title: "ColligoLink",
    keywords: ["teambl", "project"],
    accepted_users: [],
    bookmarked_users: [],
    creator: mockUser1,
    created_at: new Date("Thu, 06 Jan 2025 11:59:15 GMT"),
    start_date: new Date("Thu, 01 Jan 2025 11:59:15 GMT"),
    end_date: new Date("Thu, 05 Jan 2025 11:59:15 GMT"),
    description:
        "첫번째 난관 스마트폰과 블루투스로 통신하여 전자기기를 제어할 수 있는 리모컨 제작을 목표로 프로젝트를 시작하였으나 처음부터 난관이 생겨...",
    posts: [],
};

export const mockProject2: api.ProjectCard = {
    id: 2,
    title: "Project 2",
    keywords: ["teambl", "project"],
    accepted_users: [],
    bookmarked_users: [],
    creator: mockUser1,
    created_at: new Date("Thu, 06 Jan 2025 11:59:15 GMT"),
    start_date: new Date("Thu, 01 Jan 2025 11:59:15 GMT"),
    end_date: new Date("Thu, 05 Jan 2025 11:59:15 GMT"),
    description: "This is a project",
    posts: [],
};

export const mockProject3: api.ProjectCard = {
    id: 3,
    title: "Project 1",
    keywords: ["teambl", "project"],
    accepted_users: [],
    bookmarked_users: [],
    creator: mockUser1,
    created_at: new Date("Thu, 06 Jan 2025 11:59:15 GMT"),
    start_date: new Date("Thu, 01 Jan 2025 11:59:15 GMT"),
    end_date: new Date("Thu, 05 Jan 2025 11:59:15 GMT"),
    description: "This is a project",
    posts: [],
};

export const mockPost1: api.Post = {
    id: 1,
    project_card: 1,
    user: 1,
    content:
        "첫번째 난관 스마트폰과 블루투스로 통신하여 전자기기를 제어할 수 있는 리모컨 제작을 목표로 프로젝트를 시작하였으나 처음부터 난관이 생겨...",
    created_at: new Date("Thu, 06 Jan 2025 11:59:15 GMT"),
    like_count: 0,
    tagged_users: [],
    liked_users: [],
    images: []
};

export const mockPost2: api.Post = {
    id: 2,
    project_card: 2,
    user: 1,
    content:
        "첫번째 난관 스마트폰과 블루투스로 통신하여 전자기기를 제어할 수 있는 리모컨 제작을 목표로 프로젝트를 시작하였으나 처음부터 난관이 생겨...",
    created_at: new Date("Thu, 06 Jan 2025 11:59:15 GMT"),
    like_count: 0,
    tagged_users: [],
    liked_users: [],
    images: []
};
