import {StyleSheet, Text, TouchableHighlight, View} from "react-native";
import {useEffect, useState} from "react";
import {mockMessage1} from "@/shared/mock-data";
import {shorten, timeAgo} from "@/shared/utils";
import Avatar from "@/components/common/Avatar";
import UnreadIndicator from "@/components/conversations/UnreadIndicator";
import {sharedStyles} from "@/app/_layout";

interface ConversationThumbnailProps {
    conversation: api.Conversation;
    onPress: () => void;
}

export default function ConversationThumbnail(props: ConversationThumbnailProps) {
    const [lastMessage, setLastMessage] = useState<api.Message | null>(null);

    useEffect(() => {
        // TODO: fetch latest message in the conversation
        setLastMessage(mockMessage1);
    }, []);

    const avatarImageURL = props.conversation.other_user_profile.image;
    const name = shorten(props.conversation.other_user_profile.user_name);
    const details = shorten(`${props.conversation.other_user_profile.school}・${props.conversation.other_user_profile.major1}`);
    const lastMessageContent = lastMessage ? shorten(lastMessage.message) : "채팅을 시작하세요!";
    const lastMessageSinceDate = lastMessage ? timeAgo(lastMessage.created_at) : "";
    const isUnread = lastMessage ? !lastMessage.is_read : false;

    return (
        <TouchableHighlight onPress={props.onPress} underlayColor="transparent" activeOpacity={0.6}>
            <View style={styles.thumbnailContainer}>
                {/* Avatar picture */}
                <Avatar imageURL={avatarImageURL}/>
                {/*    Details */}
                <View style={styles.grow}>
                    {/*    Name, university, department */}
                    <View style={styles.userDetailsContainer}>
                        <Text style={sharedStyles.primaryText}>{name}</Text>
                        <Text style={sharedStyles.secondaryText}>{details}</Text>
                    </View>
                    {/*    Last message */}
                    <Text style={styles.messagePreviewText}>{lastMessageContent}</Text>
                </View>
                {/*    Indicators */}
                <View style={styles.indicatorsContainer}>
                    {/*  Last message date */}
                    <Text style={sharedStyles.secondaryText}>{lastMessageSinceDate}</Text>
                    {/*    Read/Unread indicator */}
                    {isUnread && <UnreadIndicator/>}
                </View>
            </View>
        </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    thumbnailContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    grow: {
        flexGrow: 1
    },
    userDetailsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
    },
    indicatorsContainer: {
        alignItems: "flex-end",
        gap: 8
    },
    messagePreviewText: {
        fontSize: 14
    }
})