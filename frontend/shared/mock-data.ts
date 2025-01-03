import {Conversation, Message, Profile} from "@/shared/types";

const mockProfile1: Profile = {
    user_name: "teambluser",
    school: "KAIST",
    current_academic_degree: "Undergraduate",
    year: 2023,
    major1: "Computer Science",
    major2: "Electrical Engineering",
    introduction: "Great guy",
    image: "https://teambl.net/media/profile_images/IMG_2868.jpeg",
    keywords: ["teambl", "user"]
}

export const mockConversation1: Conversation = {
    id: 1,
    user_1: 1,
    user_1_username: "teambluser1",
    user_2: 2,
    user_2_username: "teambluser2",
    other_user_profile: mockProfile1,
    deleted_for_user1: false,
    deleted_for_user2: false,
    created_at: new Date("Thu, 02 Jan 2025 11:58:11 GMT"),
    updated_at: new Date("Thu, 02 Jan 2025 11:58:11 GMT")
}

export const mockMessage1: Message = {
    id: 1,
    conversation: 1,
    sender: 1,
    message: "Hello World!",
    is_read: false,
    is_system: false,
    created_at: new Date("Thu, 02 Jan 2025 11:59:15 GMT")
}