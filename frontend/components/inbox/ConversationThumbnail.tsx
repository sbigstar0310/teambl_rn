import {Image, Text, View} from "react-native";
import {Conversation, Message} from "@/shared/types";
import {defaultAvatarImage} from "@/shared/constants";
import {useEffect, useState} from "react";
import {mockMessage1} from "@/shared/mock-data";

interface ConversationThumbnailProps {
    conversation: Conversation;
}

export default function ConversationThumbnail(props: ConversationThumbnailProps) {
    const [lastMessage, setLastMessage] = useState<Message | null>(null);

    useEffect(() => {
        // TODO: fetch latest message in the conversation
        setLastMessage(mockMessage1);
    }, []);

    const avatarImage = props.conversation.other_user_profile.image ?? defaultAvatarImage;
    const lastMessageContent = lastMessage?.message ?? "채팅을 시작하세요!";

    return (
        <View style={{
            paddingHorizontal: 16,
            flexDirection: "row",
            gap: 12
        }}>
            {/* Avatar picture */}
            <View>
                <Image width={52} height={52} source={{
                    uri: avatarImage,
                }} style={{
                    borderRadius: 1000
                }}/>
            </View>
            {/*    Details */}
            <View>
                {/*    Name, university, department */}
                <View style={{flexDirection: "row", alignItems: "center", gap: 4}}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "bold"
                    }}>{props.conversation.other_user_profile.user_name}</Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: "gray"
                        }}>{props.conversation.other_user_profile.school}・{props.conversation.other_user_profile.major1}</Text>
                </View>
                {/*    Last message */}
                <Text>{lastMessageContent}</Text>
            </View>
            {/*    Indicators */}
            <View>
                {/*  Last message date */}
                <View></View>
                {/*    Read/Unread indicator */}
                <View></View>
            </View>
        </View>
    )
}