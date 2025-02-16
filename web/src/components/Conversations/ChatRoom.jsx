import {useEffect, useState} from "react";
import conversationsApi from "./conversations-api.js";
import {getStaticFileUrl, formatSinceDate, trimContent} from "./conversations-utils.js";
import {Messages} from "./Messages.jsx";
import MessageInput from "./MessageInput.jsx";
import Avatar from "./Avatar.jsx";
import backIcon from '../../assets/backIcon.svg';
import exitIcon from '../../assets/Conversations/exitIcon.svg';
import defaultProfileImage from "../../assets/default_profile_image.svg";
import unreadIcon from "../../assets/Conversations/unreadIcon.svg";

/**
 * Chat Room displaying all the messages and input
 * @param {ChatRoomProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function ChatRoom(props) {
    const [messages, setMessages] = useState([]);
    const otherUserProfile = props.conversation.other_user_profile;

    useEffect(() => {
        loadMessages();
    }, [props.conversation.id]);

    const loadMessages = async () => {
        const data = await conversationsApi.getMessages(props.conversation.id);
        data.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(data);
    };

    const handleMessageSend = (incomingMessage) => {
        conversationsApi
            .createMessage(props.conversation.id, incomingMessage)
            .then(loadMessages)
            .then(props.onNewMessage);
    };

    const handleMessageDelete = (messageId) => {
        conversationsApi
            .deleteMessage(messageId)
            .then(loadMessages)
            .then(props.onMessageDelete);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="w-full flex p-2 gap-4 items-center text-contrast">
                {/* Back button */}
                <div
                    onClick={props.onBack}
                    className="ml-2 cursor-pointer hover:opacity-60 transition-all"
                >
                    <img src={backIcon} alt="Back"/>
                </div>
                {/* Other persons' details */}
                <div className="flex-grow flex flex-col">
                    <span className="font-semibold">{otherUserProfile.user_name}</span>
                    <span className="text-sm text-secondary">
                        {otherUserProfile.school}・{otherUserProfile.current_academic_degree}
                    </span>
                </div>
                {/* Logout */}
                <div
                    onClick={props.onExit}
                    className="flex justify-center items-center px-2 cursor-pointer hover:opacity-60 transition-all"
                >
                    <img src={exitIcon} alt="Exit"/>
                </div>
            </div>
            {/* Messages */}
            <div className="flex-grow overflow-y-auto">
                <Messages
                    messages={messages}
                    conversation={props.conversation}
                    myId={props.myId}
                    onMessageDelete={handleMessageDelete}
                />
            </div>
            {/* Message input */}
            <MessageInput onSubmit={handleMessageSend}/>
        </div>
    );
}

/**
 * Chat Thumbnail displayed in the list of chats
 * @param {ConversationThumbnailProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export function ConversationThumbnail(props) {
    const {
        myId,
        lastMessage,
        onClick
    } = props;
    const isUnread =
        lastMessage &&
        lastMessage.sender !== myId &&
        !lastMessage.is_read;
    const otherUserProfile = props.conversation.other_user_profile;

    const messagePreview =
        lastMessage && lastMessage.message
            ? trimContent(lastMessage.message)
            : "대화를 시작하세요"; // en: Start a conversation

    const timeSinceLastMessage = lastMessage
        ? formatSinceDate(new Date(lastMessage.created_at))
        : "";
    const imageUrl = otherUserProfile.image ? getStaticFileUrl(otherUserProfile.image) : defaultProfileImage

    return (
        <div
            className="w-full flex items-center gap-3 p-2 rounded-md cursor-pointer"
            onClick={onClick}
        >
            {/* User avatar */}
            <Avatar user_name={otherUserProfile.user_name} image_url={imageUrl}/>
            {/* Chat details */}
            <div
                className={
                    "flex-grow flex flex-col justify-between gap-1" +
                    (isUnread ? " font-semibold" : "")
                }
            >
                {/* First Row */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        {/* Name */}
                        <span className="text-md font-semibold">{trimContent(otherUserProfile.user_name)}</span>
                        {/* Department */}
                        <span className="text-xs font-normal text-secondary">{trimContent(otherUserProfile.current_academic_degree)}</span>
                    </div>
                    {/* Time since last message date */}
                    <span className="text-secondary text-xs">{timeSinceLastMessage}</span>
                </div>
                {/* Second Row */}
                <div className="flex justify-between items-center">
                    {/* Latest message text */}
                    <span className="text-sm">{messagePreview}</span>
                    {/* Unread indicator */}
                    {isUnread && <UnreadIndicator/>}
                </div>
            </div>
        </div>
    );
}

export function ConversationThumbnailLoader() {
    return (
        <div className="flex items-center gap-4 p-2 bg-secondary opacity-20 rounded-md animate-pulse">
            <div className="w-12 h-12 bg-default rounded-full"></div>
            <div className="flex-1 flex flex-col gap-2">
                <div className="bg-default h-4 rounded w-1/3"></div>
                <div className="bg-default h-4 rounded"></div>
            </div>
        </div>
    );
}

function UnreadIndicator() {
    return (
        <div className="w-4 h-4 flex justify-center items-center bg-primary rounded-full">
            <img src={unreadIcon} alt="N"/>
        </div>
    );
}

/**
 * @typedef {Object} ChatRoomProps
 * @prop {Conversation} conversation
 * @prop {User} me
 * @prop {Function} onBack
 * @prop {Function} onNewMessage
 * @prop {Function} onMessageDelete
 * @prop {Function} onExit
 */

/**
 * @typedef {Object} ConversationThumbnailProps
 * @prop {number} myId
 * @prop {Conversation} conversation
 * @prop {Message} lastMessage
 * @prop {Function} onClick
 */