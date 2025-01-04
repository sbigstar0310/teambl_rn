import {DEFAULT_TEXT_MAX_LENGTH} from "@/shared/constants";

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
};

export function shorten(text: string, maxLength: number = DEFAULT_TEXT_MAX_LENGTH): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 1) + "...";
}

export function combineUserDetails(school?: string, department?: string) {
    if (school && department) return `${shorten(school)}・${shorten(department)}`;
    if (school) return shorten(school);
    if (department) return shorten(department);
    return "";
}