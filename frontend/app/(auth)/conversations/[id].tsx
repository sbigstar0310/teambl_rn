import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import {router, useLocalSearchParams} from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import {useEffect, useRef, useState} from "react";
import {mockConversation1, mockMessage1} from "@/shared/mock-data";
import {combineUserDetails, MessageEntity, produceMessageEntities, shorten} from "@/shared/utils";
import Popup from "@/components/Popup";
import Message from "@/components/conversations/Message";
import MessageInput from "@/components/conversations/MessageInput";
import InfoMessage from "@/components/conversations/InfoMessage";
import ExitIcon from '@/assets/conversations/exit-icon.svg';

import fetchCurrentUser from "@/libs/apis/currentUser";

import createConversation from "@/libs/apis/createConversation";
import getConversation from "@/libs/apis/getConversation";
import deleteConversation from "@/libs/apis/deleteConversation";

import getMessage from "@/libs/apis/getMessage";
import getLatestMessage from "@/libs/apis/getLatestMessage";
import createMessage from "@/libs/apis/createMessage";
import deleteMessage from "@/libs/apis/deleteMessage";
import markConversationAsRead from "@/libs/apis/markConversationAsRead";

export default function Conversation() {
    const {id} = useLocalSearchParams();
    const myId = 1;
    const [conversation, setConversation] = useState<api.Conversation>();
    const [entities, setEntities] = useState<MessageEntity[]>([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const listRef = useRef<FlatList>(null);
    const [conversations, setConversations] = useState<api.Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // TODO: fetch conversation data from api
        fetchConversation();
        setConversation(mockConversation1);
    }, []);

    useEffect(() => {
        // TODO: fetch messages from api
        const messages = [mockMessage1];
        fetchMessage();
        setEntities(produceMessageEntities(messages));
    }, []);

    const fetchConversation = async () => {
        try {
            const data = await getConversation();
            if (data) {
                setConversations(data); // 서버에서 받은 대화 목록 설정
            } else {
                setConversations([]); // 데이터가 없을 경우 빈 배열 설정
            }
            console.log("Fetched Conversations:", conversations);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
            setConversations([]); // 에러 발생 시 빈 배열로 초기화
        } finally {
            setLoading(false); // 로딩 상태 종료
        }
    };

    const fetchMessage = async () => {
        try {
            if (!id) return; // 대화 ID가 없으면 중단
            const messages = await getMessage(id as string); // 메시지 데이터 가져오기
            setEntities(produceMessageEntities(messages)); // 메시지 엔터티로 변환
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToEnd = () => listRef.current?.scrollToEnd({animated: true});
    const handleExitButtonPress = () => setIsPopupVisible(true);
    
    // TODO: make api to request and exit the chat
    const handleExit = async () => {
        if (!id) return; // 대화 ID가 없으면 중단
    
        try {
            await deleteConversation(id as string);
            console.log("Conversation deleted successfully");
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        } finally {
            router.back();
        }
    }

    // const handleMessageSend = (text: string, image?: string) => {
    //     if (!conversation) return;
    //     // TODO: send message to backend
    //     const messages = entities.filter(e => e.type !== "date").map(e => e.data);
    //     let newId = 1;
    //     if (messages.length > 0) {
    //         newId = messages[messages.length - 1].id + 1;
    //     }
    //     const newMessage: api.Message = {
    //         conversation: conversation.id,
    //         is_read: false,
    //         message: text,
    //         id: newId,
    //         image: image,
    //         sender: myId,
    //         is_system: false,
    //         created_at: new Date()
    //     };
    //     const updatedMessages = [...messages, newMessage];
    //     setEntities(produceMessageEntities(updatedMessages));
    // }

    const handleMessageSend = async (text: string, image?: string) => {
        if (!conversation) return;
    
        // 기존 메시지 상태 업데이트 (UI에 즉시 반영)
        const messages = entities.filter((e) => e.type !== "date").map((e) => e.data);
        let newId = 1;
        if (messages.length > 0) {
            newId = messages[messages.length - 1].id + 1;
        }
    
        const tempMessage: api.Message = {
            conversation: conversation.id,
            is_read: false,
            message: text,
            id: newId,
            image: image,
            sender: myId,
            is_system: false,
            created_at: new Date(),
        };
    
        const updatedMessages = [...messages, tempMessage];
        setEntities(produceMessageEntities(updatedMessages));
    
        try {
            // 이미지가 문자열(URL)일 경우 Blob으로 변환
            let file: File | undefined;
            if (image) {
                const response = await fetch(image);
                const blob = await response.blob();
                file = new File([blob], "uploaded_image.jpg", { type: blob.type });
            }
    
            // createMessage API 호출
            const newMessage = await createMessage(String(conversation.id), { message: text, image: file });
    
            // 백엔드 응답 메시지로 상태 업데이트
            setEntities((prevEntities) => {
                const allMessages = prevEntities.filter((e) => e.type !== "date").map((e) => e.data);
                const updatedAllMessages = [...allMessages.filter((m) => m.id !== tempMessage.id), newMessage];
                return produceMessageEntities(updatedAllMessages);
            });
    
            console.log("Message sent successfully:", newMessage);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    // const handleMessageDelete = (message: api.Message) => {
    //     //     TODO: make api request about deleting message
    //     const messages = entities.filter(e => e.type !== "date").map(e => e.data);
    //     const newMessages = messages.map((m) => {
    //         if (m.id === message.id) return {...m, message: "메시지가 삭제되었습니다", image: undefined}
    //         else return m;
    //     })
    //     setEntities(produceMessageEntities(newMessages));
    // }

    const handleMessageDelete = async (message: api.Message) => {
        // UI 상태 업데이트 (즉시 반영)
        const messages = entities.filter((e) => e.type !== "date").map((e) => e.data);
        const newMessages = messages.map((m) => {
            if (m.id === message.id) {
                return { ...m, message: "메시지가 삭제되었습니다", image: undefined };
            } else {
                return m;
            }
        });
        setEntities(produceMessageEntities(newMessages));
    
        try {
            await deleteMessage(String(message.id));
            console.log(`Message with ID ${message.id} deleted successfully`);
        } catch (error) {
            console.error(`Failed to delete message with ID ${message.id}:`, error);
        }
    };


    return (
        <View style={sharedStyles.container}>
            <ScreenHeader
                title={() => <ConversationHeaderTitle conversation={conversation}/>}
                actionButton={() => <ExitConversationButton onPress={handleExitButtonPress}/>}
            />
            <View style={styles.body}>
                {/*    Messages list */}
                <FlatList
                    ref={listRef}
                    contentContainerStyle={styles.listContainer}
                    data={entities}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({item}) =>
                        item.type === "message" ? (
                            <Message
                                message={item.data}
                                isSentByMe={item.data.sender === myId}
                                onDelete={() => handleMessageDelete(item)}
                            />) : (
                            <InfoMessage entity={item}/>
                        )
                    }
                    ListEmptyComponent={NoMessagesFound}
                    /* New message arrival (list data update) triggers content size change */
                    onContentSizeChange={scrollToEnd.bind(null)}
                    /* Opening keyboard triggers onLayout */
                    onLayout={scrollToEnd.bind(null)}
                />
                <MessageInput
                    onSend={handleMessageSend}
                />
            </View>
            <Popup
                title="대화창을 나가겠습니까?"
                description="대화창에서 나가면 이전 대화 내용들은 삭제 됩니다."
                isVisible={isPopupVisible}
                onClose={() => setIsPopupVisible(false)}
                onConfirm={handleExit}
            />
        </View>
    )
}

interface ConversationHeaderTitleProps {
    conversation?: api.Conversation;
}

function ConversationHeaderTitle(props: ConversationHeaderTitleProps) {
    const title = shorten(props.conversation?.other_user_profile.user_name || "Conversation");
    const subtitle = combineUserDetails(
        props.conversation?.other_user_profile.school,
        props.conversation?.other_user_profile.major1
    );

    return (
        <View>
            <Text style={sharedStyles.primaryText}>{title}</Text>
            <Text style={sharedStyles.secondaryText}>{subtitle}</Text>
        </View>
    )
}

interface ExitButtonProps {
    onPress: () => void;
}

function ExitConversationButton(props: ExitButtonProps) {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <ExitIcon width={20} height={20} />
        </TouchableOpacity>
    )
}

function NoMessagesFound() {
    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered]}>
            <Text style={[styles.text, styles.title]}>메시지가 없습니다.</Text>
            <Text style={[styles.text]}>일촌에게 메시지를 보내보세요.</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "gray",
        textAlign: "center"
    },
    title: {
        fontSize: 16,
        fontWeight: "bold"
    },
    listContainer: {
        gap: 4,
        paddingHorizontal: 8
    },
    body: {
        justifyContent: "space-between",
        flex: 1
    }
})