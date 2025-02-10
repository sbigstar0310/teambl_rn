import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import {router, useLocalSearchParams} from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import {useEffect, useRef, useState} from "react";
import {combineUserDetails, MessageEntity, produceMessageEntities, shorten} from "@/shared/utils";
import Popup from "@/components/Popup";
import Message from "@/components/conversations/Message";
import MessageInput from "@/components/conversations/MessageInput";
import InfoMessage from "@/components/conversations/InfoMessage";
import ExitIcon from '@/assets/conversations/exit-icon.svg';
import getConversation from "@/libs/apis/Conversation/getConversation";
import deleteConversation from "@/libs/apis/Conversation/deleteConversation";
import getMessage from "@/libs/apis/Conversation/getMessage";
import createMessage from "@/libs/apis/Conversation/createMessage";
import deleteMessage from "@/libs/apis/Conversation/deleteMessage";

export default function Conversation() {
    const {id} = useLocalSearchParams();
    const myId = 1;
    const [conversation, setConversation] = useState<api.Conversation>();
    const [entities, setEntities] = useState<MessageEntity[]>([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchConversation();
    }, []);

    useEffect(() => {
        if (!conversation) return;
        fetchMessages();
    }, [conversation]);

    const fetchConversation = async () => {
        try {
            const data = await getConversation();
            const conversation = data.find((c) => c.id === Number(id));
            if (conversation) {
                setConversation(conversation); // 서버에서 받은 대화 목록 설정
            } else {
                router.push('/conversations');
            }
            console.log("Fetched Conversations:", data);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
            router.push('/conversations');
        } finally {
            // setLoading(false); // 로딩 상태 종료
        }
    };

    const fetchMessages = async () => {
        try {
            if (!id) return; // 대화 ID가 없으면 중단
            const messages = await getMessage(id as string); // 메시지 데이터 가져오기
            const entities = produceMessageEntities(messages); // 메시지 엔터티로 변환
            setEntities(entities);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            // setLoading(false);
        }
    };

    const scrollToEnd = () => listRef.current?.scrollToEnd({animated: true});
    const handleExitButtonPress = () => setIsPopupVisible(true);

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
    const handleMessageSend = async (text: string, image?: string) => {
        if (!conversation) return;
        try {
            // 이미지가 문자열(URL)일 경우 Blob으로 변환
            let file: File | undefined;
            if (image) {
                const response = await fetch(image);
                const blob = await response.blob();
                file = new File([blob], "uploaded_image.jpg", {type: blob.type});
            }

            // createMessage API 호출
            const newMessage = await createMessage(String(conversation.id), {message: text, image: file});
            console.log("Message sent successfully:", newMessage);
            fetchMessages();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleMessageDelete = async (message: api.Message) => {
        try {
            await deleteMessage(String(message.id));
            console.log(`Message with ID ${message.id} deleted successfully`);
        } catch (error) {
            console.error(`Failed to delete message with ID ${message.id}:`, error);
        } finally {
            fetchMessages();
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
            <ExitIcon width={20} height={20}/>
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