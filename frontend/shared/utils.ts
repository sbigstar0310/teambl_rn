import { DEFAULT_TEXT_MAX_LENGTH, USER_ID } from "@/shared/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function timeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes === 1) return "1분 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1시간 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1일 전";
    if (diffInDays < 30) return `${diffInDays}일 전`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return "1달 전";
    return `${diffInMonths}달 전`;
}

export function shorten(
    text: string,
    maxLength: number = DEFAULT_TEXT_MAX_LENGTH
): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 1) + "...";
}

export function combineUserDetails(school?: string, department?: string) {
    if (school && department)
        return `${shorten(school)}・${shorten(department)}`;
    if (school) return shorten(school);
    if (department) return shorten(department);
    return "";
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export type MessageEntity =
    | {
    type: "message";
    data: api.Message;
}
    | {
    type: "date";
    data: Date;
}
    | {
    type: "system_message";
    data: api.Message;
};

export const produceMessageEntities = (messages: api.Message[]) => {
    const entities: MessageEntity[] = [];
    let lastMessage: api.Message | null = null;
    for (const message of messages) {
        // Add date entity if day differs from last message
        // (or if it's the very first message)
        if (
            !lastMessage ||
            !isSameDay(new Date(lastMessage.created_at), new Date(message.created_at))
        ) {
            entities.push({type: "date", data: new Date(message.created_at)});
        }
        // Add system message entity if it's system message
        if (message.is_system) {
            entities.push({type: "system_message", data: message});
        } else {
            entities.push({
                type: "message", data: {
                    ...message,
                    created_at: new Date(message.created_at)
                }
            });
        }
        lastMessage = message;
    }
    return entities;
};

export const getCurrentUserId = async (): Promise<string | null> => {
    const userId = await AsyncStorage.getItem(USER_ID);
    return userId ?? null;
};

export const getAddedCharIndex = (prevText: string, newText: string, character = "@") => {
    for (let i = 0; i < newText.length; i++) {
        if (prevText.length >= i && prevText[i] !== newText[i]) {
            if (newText[i] === character) {
                return i;
            }
        }
    }
    return -1;
}