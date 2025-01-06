import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import {router, useLocalSearchParams} from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import {useEffect, useRef, useState} from "react";
import {mockConversation1} from "@/shared/mock-data";
import {combineUserDetails, shorten} from "@/shared/utils";
import Popup from "@/components/Popup";
import Message from "@/components/inbox/Message";
import MessageInput from "@/components/inbox/MessageInput";

export default function Conversation() {
    const {id} = useLocalSearchParams();
    const myId = 1;
    const [conversation, setConversation] = useState<api.Conversation>();
    const [messages, setMessages] = useState<api.Message[]>([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        // TODO: fetch conversation data from api
        setConversation(mockConversation1);
    }, []);

    const scrollToEnd = () => listRef.current?.scrollToEnd({animated: true});
    const handleExitButtonPress = () => setIsPopupVisible(true);
    const handleExit = () => {
        // TODO: make api to request and exit the chat
        router.back();
    }
    const handleMessageSend = (text: string, image?: string) => {
        if (!conversation) return;
        // TODO: send message to backend
        let newId = 1;
        if (messages.length > 0) {
            newId = messages[messages.length - 1].id + 1;
        }
        const newMessage: api.Message = {
            conversation: conversation.id,
            is_read: false,
            message: text,
            id: newId,
            image: image,
            sender: myId,
            is_system: false,
            created_at: new Date()
        };
        setMessages((messages) => [...messages, newMessage]);
    }

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
                    data={messages}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({item}) =>
                        <Message
                            message={item}
                            isSentByMe={item.sender === myId}
                        />
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
            <Image source={require('@/assets/exit-icon.png')} width={48} height={48}/>
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