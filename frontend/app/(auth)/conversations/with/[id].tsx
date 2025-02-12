import {View} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import {useEffect} from "react";
import getConversation from "@/libs/apis/Conversation/getConversation";
import createConversation from "@/libs/apis/Conversation/createConversation";

export default function ConversationWithUser() {
    const {id} = useLocalSearchParams();

    useEffect(() => {
        if (!id) return;
        openConversation(id as string);
    }, [id]);

    const openConversation = async (withUserId: string) => {
        try {
            // Check if conversation already exists
            const conversations = await getConversation();
            const conversation = conversations
                .find((c) => String(c.user_1) === withUserId || String(c.user_2) === withUserId);
            if (conversation) {
                router.replace(`/conversations/${conversation.id}`);
                return;
            }
            // Create new conversation if it does not exist
            const {id} = await createConversation(withUserId)
            router.replace(`/conversations/${id}`);
        } catch (error) {
            console.error('Failed to open conversation:', error);
            router.back();
        }
    }

    return (
        <View>
        </View>
    )
}