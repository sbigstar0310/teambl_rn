import {useEffect, useMemo, useRef, useState} from "react";
import {formatDate, formatTime, getStaticFileUrl, isInSameDay} from "./conversations-utils.js";
import removeIcon from '../../assets/Conversations/removeIcon.svg';
import copyIcon from '../../assets/Conversations/copyIcon.svg';
import copiedIcon from '../../assets/Conversations/copiedIcon.svg';
import checkIcon from '../../assets/Conversations/checkIcon.svg';
import checkDoubleIcon from '../../assets/Conversations/checkDoubleIcon.svg';


/**
 * Messages List
 * @param {MessagesProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export function Messages(props) {
    const {messages, conversation, myId, onMessageDelete} = props;
    const messagesEndRef = useRef(null);

    const entities = useMemo(() => {
        const entities = [];
        let lastDate = null;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            // lastOfAuthor is used to determine if the message is the last one from the same author
            let lastOfAuthor = false;
            if (messages[i + 1] && messages[i + 1].sender !== message.sender) {
                // If the next message is from a different author
                lastOfAuthor = true;
            }
            if (i === messages.length - 1) {
                // If it's the last message in the list
                lastOfAuthor = true;
            }
            const createdAt = new Date(message.created_at);
            if (!lastDate || !isInSameDay(lastDate, createdAt)) {
                entities.push(createdAt);
                lastDate = createdAt;
            }
            entities.push({message, lastOfAuthor});
        }
        return entities;
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    return (
        <div className="flex flex-col justify-end gap-1 px-4 py-1">
            {entities.length === 0 && (
                <div className="mt-8 text-xs text-secondary font-semibold text-center py-1">
                    {/* No messages yet */}
                    아직 메시지가 없습니다
                </div>
            )}
            {entities.map((entity, i) =>
                entity instanceof Date ? (
                    <div
                        key={i}
                        className="text-xs text-secondary font-semibold text-center py-1"
                    >
                        {formatDate(entity)}
                    </div>
                ) : (
                    entity.message.is_system ? (
                            <div
                                key={i}
                                className="text-sm text-secondary font-semibold text-center py-1"
                            >
                                {entity.message.message}
                            </div>
                        ) :
                        (
                            <MessageBox
                                isLastOfAuthor={entity.lastOfAuthor}
                                key={i}
                                message={entity.message}
                                conversation={conversation}
                                myId={myId}
                                onDelete={() => onMessageDelete(entity.message.id)}
                            />
                        )
                )
            )}
            <div ref={messagesEndRef}></div>
        </div>
    );
}

/**
 * Message display
 * @param {MessageBoxProps} props
 * @returns {JSX.Element}
 * @constructor
 */
function MessageBox(props) {
    const {isLastOfAuthor, message, myId, onDelete} = props;
    const isMine = message.sender === myId;
    const isRead = message.is_read;
    const image = message.image && getStaticFileUrl(message.image);
    const hasContent = message.message !== "";
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!message.message) return;
        navigator.clipboard.writeText(message.message).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
        });
    };

    const handleImageOpen = () => {
        window.open(image, "_blank");
    };

    return (
        <div
            className={
                "group/container w-full flex flex-col" +
                (isMine ? " items-end" : "") +
                (isLastOfAuthor ? " mb-2" : "")
            }
        >
            <div
                className={`w-full flex justify-start items-end gap-1 ${
                    isMine ? "flex-row-reverse" : ""
                }`}
            >
                <div
                    className={
                        "group/content flex flex-col relative " +
                        (isMine ? "items-end" : "items-start")
                    }
                >
                    {image && (
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex justify-end flex-wrap gap-0.5">
                                <div
                                    onClick={handleImageOpen}
                                    className="flex w-32 h-32 items-center justify-center rounded-lg cursor-pointer hover:opacity-60 transition-all"
                                >
                                    <img
                                        width={64}
                                        height={64}
                                        className="w-32 h-32 object-cover rounded-lg"
                                        src={image}
                                        alt="Image"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Message text */}
                    {hasContent && (
                        <pre
                            className={`no-margin max-w-2xl text-wrap break-words py-1.5 px-3 rounded-md font-sans ${
                                isMine ? "bg-primary-bg" : "bg-secondary-bg"
                            } text-contrast`}
                        >
                            {message.message}
                        </pre>
                    )}
                    {/* Actions: Copy / Delete */}
                    <div
                        className="hidden group-hover/content:flex absolute z-50 -bottom-4 bg-secondary-bg p-1.5 gap-1 rounded-xl">
                        {hasContent && <div
                            className="cursor-pointer opacity-50 hover:opacity-100"
                            onClick={handleCopy}
                        >
                            <img
                                src={isCopied ? copiedIcon : copyIcon}
                                alt="Copy"
                            />
                        </div>}
                        {isMine && (
                            <div
                                className="cursor-pointer opacity-50 hover:opacity-100 text-red-500"
                                onClick={onDelete}
                            >
                                <img src={removeIcon} alt="Remove"/>
                            </div>
                        )}
                    </div>
                </div>
                <div
                    className={
                        isLastOfAuthor ? "flex" : "hidden group-hover/container:flex"
                    }
                >
                    {/* Read status */}
                    {isMine && (
                        <div
                            className={
                                "self-center mr-0.5 text-secondary group-hover/container:block" +
                                (isRead ? " hidden" : "")
                            }
                        >
                            <img src={isRead ? checkDoubleIcon : checkIcon} alt="status"/>
                        </div>
                    )}
                    {/* Sent time */}
                    <div className="text-xs text-secondary">
                        {formatTime(new Date(message.created_at))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * @typedef {Object} MessagesProps
 * @prop {Array} messages
 * @prop {Conversation} conversation
 * @prop {number} myId
 * @prop {Function} onMessageDelete
 */

/**
 * @typedef {Object} MessageBoxProps
 * @prop {boolean} isLastOfAuthor
 * @prop {Message} message
 * @prop {Conversation} conversation
 * @prop {number} myId
 * @prop {Function} onDelete
 */