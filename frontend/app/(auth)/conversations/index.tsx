import {useEffect, useState} from "react";
import {FlatList, StyleSheet, Text, View} from "react-native";
import {router} from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import {sharedStyles} from "@/app/_layout";
import ConversationThumbnail from "@/components/conversations/ConversationThumbnail";
import getConversation from "@/libs/apis/Conversation/getConversation";

export default function InboxScreen() {
    const [conversations, setConversations] = useState<api.Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchConversation();
    }, []);

    const fetchConversation = async () => {
        try {
            const data = await getConversation();
            if (data) {
                setConversations(data); // 서버에서 받은 대화 목록 설정
            } else {
                setConversations([]); // 데이터가 없을 경우 빈 배열 설정
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
            setConversations([]); // 에러 발생 시 빈 배열로 초기화
        } finally {
            setLoading(false); // 로딩 상태 종료
        }
    };

    const handleSelect = (conversation: api.Conversation) => {
        router.push(`/conversations/${conversation.id}`);
    }

    if (loading) {
        return (
            <View style={[sharedStyles.container, sharedStyles.contentCentered]}>
                <Text style={styles.text}>로딩 중...</Text>
            </View>
        );
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
});