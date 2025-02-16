import {useState, useEffect, useMemo} from "react";
import conversationsApi from "../components/Conversations/conversations-api";
import NoChatRoom from "../components/Conversations/NoChatRoom";
import Inbox from "../components/Conversations/Inbox";
import ExitConfirmation from "../components/Conversations/ExitConfirmation";
import ChatRoom from "../components/Conversations/ChatRoom.jsx";
import SearchUsers from "../components/Conversations/SearchUsers.jsx";

export default function Conversations() {
    // States
    const [isLoading, setIsLoading] = useState(true);
    const [me, setMe] = useState(null);
    const [thumbnails, setThumbnails] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isInbox = useMemo(() => !selectedConversationId, [selectedConversationId]);

    // Effects
    useEffect(() => {
        // Load user info from API
        conversationsApi.getMe().then(setMe);
        loadConversations();
    }, []);

    const loadConversations = async () => {
        const conversations = await conversationsApi.getConversations();
        await loadThumbnails(conversations)
        setIsLoading(false);
    }

    const loadThumbnails = async (conversations) => {
        // Load last messages for each chat and update thumbnails
        const promises = conversations.map((conversation) => conversationsApi
            .getLatestMessage(conversation.id)
            .then((data) => ({
                conversation,
                lastMessage: data,
            }))
        );
        const data = await Promise.all(promises);
        data.sort((a, b) => a.lastMessage ? (b.lastMessage ? (
            new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
        ) : 1) : -1);
        setThumbnails(data);
    }

    const handleConversationSelection = async (conversationId) => {
        const thumbnail = thumbnails.find((c) => c.conversation.id === conversationId);
        if (!thumbnail) return;
        setSelectedConversationId(conversationId);
        const lastMessage = thumbnail.lastMessage;
        if (
            lastMessage && // If there is a last message on the chat
            me && // If the user is logged in
            lastMessage.sender !== me.id && // If the last message is received (not sent)
            !lastMessage.is_read // If the last message is not read
        ) {
            conversationsApi.markAsRead(conversationId).then(loadConversations);
        }
    };

    const handleBackFromSearch = () => {
        setIsSearching(false);
    };

    const handleBackFromConversation = () => {
        setSelectedConversationId(null);
    };

    const handleNewMessage = loadConversations;

    const handleMessageDelete = loadConversations;

    const showSearch = () => {
        setIsSearching(true);
    };

    const handleNewConversation = (userId) => {
        conversationsApi.createConversation(userId).then((conversation) => {
            if (!conversation && me) {
                // conversation may already exist
                const thumbnail = thumbnails.find(
                    t =>
                        (t.conversation.user_1 === userId && t.conversation.user_2 === me.id) ||
                        (t.conversation.user_2 === userId && t.conversation.user_1 === me.id)
                );
                if (!thumbnail) return; // it does not exist
                // select if already exists
                handleConversationSelection(thumbnail.conversation.id)
            } else {
                loadConversations()
                    .then(() => handleConversationSelection(conversation.id));
            }
            setIsSearching(false);
        });
    };

    const handleChatExit = () => {
        if (!me) return;
        setIsModalOpen(false);
        if (!selectedConversationId) return;
        handleBackFromConversation();
        conversationsApi.deleteConversation(selectedConversationId).then(loadConversations);
    };

    return (
        <div className="flex h-screen overflow-hidden p-1">
            {/* List of chats (sidebar on desktop) */}
            <div
                className={
                    "w-full md:w-1/3 flex flex-col border-r-secondary-bg" +
                    (isInbox ? "" : " hidden md:flex")
                }
                style={{borderRightWidth: 1}}
            >
                {me && isSearching ? (
                    <SearchUsers
                        onBack={handleBackFromSearch}
                        onConfirm={handleNewConversation}
                    />
                ) : (
                    <Inbox
                        myId={me?.id}
                        isLoading={isLoading}
                        thumbnails={thumbnails}
                        onConversationSelect={handleConversationSelection}
                        onNewConversation={showSearch}
                    />
                )}
            </div>
            {/* Chatroom */}
            <div className={"flex-grow " + (isInbox ? " hidden md:block" : "")}>
                {!!selectedConversationId && me ? (
                    <ChatRoom
                        conversation={thumbnails.find(c => c.conversation.id === selectedConversationId)?.conversation}
                        myId={me.id}
                        onBack={handleBackFromConversation}
                        onNewMessage={handleNewMessage}
                        onMessageDelete={handleMessageDelete}
                        onExit={() => setIsModalOpen(true)}
                    />
                ) : (
                    <NoChatRoom/>
                )}
                {isModalOpen && (
                    <ExitConfirmation
                        onCancel={() => setIsModalOpen(false)}
                        onConfirm={handleChatExit}
                    />
                )}
            </div>
        </div>
    );
}
