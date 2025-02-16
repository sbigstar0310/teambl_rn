const MAX_LENGTH = 25;
const STATIC_FILES_URL = import.meta.env.VITE_API_URL;

export const getStaticFileUrl = (path) => STATIC_FILES_URL + path;

export const trimContent = (message, maxLength = MAX_LENGTH) => {
    return message.length > maxLength
        ? message.slice(0, maxLength) + "..."
        : message;
};

export const isInSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

export const formatDate = (date) => {
    return date.toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export const formatSinceDate = (date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 0) {
        return '0s';
    }
    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m`;
    }
    if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)}h`;
    }
    return `${Math.floor(seconds / 86400)}d`;
}

export const formatTime = (date) => {
    return date.toLocaleString([], { hour: "numeric", minute: "2-digit" });
}