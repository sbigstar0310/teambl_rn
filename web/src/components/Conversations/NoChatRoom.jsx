import conversationsIcon from '../../assets/conversationsIcon.svg';

/**
 * Placeholder when no chatroom is selected
 * @returns {JSX.Element}
 * @constructor
 */
export default function NoChatRoom() {
    return (
        <div className="flex flex-col gap-1 justify-center items-center h-full">
            <div className="my-2 border-2 border-contrast rounded-full p-5">
                <img src={conversationsIcon} alt="Conversations" />
            </div>
            <span className="text-xl">
        {/* en: Your messages */}
                당신의 메시지
      </span>
            <span className="text-sm text-secondary">
        {/* en: Send a message to start a chat. */}
                채팅을 시작하려면 메시지를 보내세요.
      </span>
        </div>
    );
}
