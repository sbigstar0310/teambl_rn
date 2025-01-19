import {useEffect, useState} from "react";
import {FlatList, StyleSheet, Text, View} from "react-native";
import {router} from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import {sharedStyles} from "@/app/_layout";
import {mockConversation1, mockConversation2, mockConversation3} from "@/shared/mock-data";
import ConversationThumbnail from "@/components/conversations/ConversationThumbnail";

const mockConversations: api.Conversation[] = [mockConversation1, mockConversation2, mockConversation3];

export default function InboxScreen() {
    const [conversations, setConversations] = useState<api.Conversation[]>([]);

    useEffect(() => {
        //     TODO: fetch data from backend
        setConversations(mockConversations);
    }, []);

    const handleSelect = (conversation: api.Conversation) => {
        router.push(`/conversations/${conversation.id}`);
    }

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader title="메시지"/>
            <FlatList
                style={sharedStyles.horizontalPadding}
                contentContainerStyle={styles.listContainer}
                data={conversations}
                keyExtractor={(_, i) => i.toString()}
                renderItem={
                    ({item, index}) =>
                        <ConversationThumbnail key={index} conversation={item} onPress={() => handleSelect(item)}/>
                }
                ListEmptyComponent={NoConversationFound}
            />
        </View>
    )
}

function NoConversationFound() {
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
        gap: 20
    }
})