import {useNavigate} from "react-router-dom";
import backIcon from '../../assets/backIcon.svg';
import TextButton from "./TextButton.jsx";
import {ConversationThumbnail, ConversationThumbnailLoader} from "./ChatRoom.jsx";

/**
 * Inbox of the user conversations
 * @param {InboxProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function Inbox(props) {
    const navigate = useNavigate();
    const handleBack = () => navigate("/home");

    return (
        <>
            {/* Header */}
            <div className="w-full flex p-2 pt-4 gap-4 items-center text-contrast">
                {/* Back button */}
                <div
                    onClick={handleBack}
                    className="ml-2 mt-1 cursor-pointer hover:opacity-60 transition-all"
                >
                    <img className="block" src={backIcon} alt="Back"/>
                </div>
                {/* Title */}
                <span className="text-md font-semibold flex-grow">
                    {/* en: Messages */}
                    메시지
                </span>
                {/* Search button */}
                <TextButton
                    // en: New chat
                    text="새 메시지"
                    onClick={props.onNewConversation}
                />
            </div>
            {props.isLoading ? (
                <ChatsListLoader/>
            ) : (props.thumbnails.length === 0 ? (
                    // Display information about blank chatlist
                    <div className="h-full flex flex-col justify-center items-center text-secondary">
                        {/* en: There are no messages */}
                        <span className="text-sm font-semibold">메시지가 없습니다.</span>
                        {/* en: Send a message to your connection */}
                        <span className="text-xs">일촌에게 메시지를 보내보세요.</span>
                        <span className="h-20"></span>
                    </div>
                ) : (
                    // Display list of chats
                    <div className="h-full overflow-y-auto flex flex-col gap-2 py-1 px-3">
                        {props.thumbnails.map(({conversation, lastMessage}, i) => (
                                <ConversationThumbnail
                                    key={i}
                                    conversation={conversation}
                                    lastMessage={lastMessage}
                                    myId={props.myId}
                                    onClick={() => props.onConversationSelect(conversation.id)}
                                />
                            )
                        )}
                    </div>)
            )
            }
        </>
    )
        ;
}


export function ChatsListLoader() {
    return (
        <div className="h-full overflow-y-auto flex flex-col gap-4 p-4">
            <ConversationThumbnailLoader/>
            <ConversationThumbnailLoader/>
            <ConversationThumbnailLoader/>
            <ConversationThumbnailLoader/>
            <ConversationThumbnailLoader/>
        </div>
    );
}

/**
 * @typedef {Object} InboxProps
 * @prop {boolean} isLoading
 * @prop {number} myId
 * @prop {Array} thumbnails
 * @prop {Function} onConversationSelect
 * @prop {Function} onNewConversation
 */