import {Fragment, useEffect, useState} from "react";
import {Stack} from "expo-router";
import {Conversation} from "@/shared/types";
import ConversationThumbnail from "@/components/inbox/ConversationThumbnail";
import {FlatList, Text, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import {mockConversation1} from "@/shared/mock-data";

const mockConversations: Conversation[] = [mockConversation1];

export default function InboxScreen() {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        //     TODO: fetch data from backend
        setConversations(mockConversations);
    }, []);


    return (
        <Fragment>
            <Stack.Screen options={{
                headerTitle: "메시지",
                headerShadowVisible: false,
                headerStyle: {backgroundColor: "transparent"}
            }}/>
            {conversations.length > 0 ?
                <FlatList
                    data={conversations}
                    renderItem={
                        ({item}) =>
                            <ConversationThumbnail conversation={item}/>
                    }
                    ListEmptyComponent={NoConversationFound}
                /> :
                <NoConversationFound/>
            }
        </Fragment>
    )
}

function NoConversationFound() {
    return (
        <View style={[sharedStyles.container]}>
            <Text style={{color: "gray", fontSize: 16, fontWeight: "bold"}}>메시지가 없습니다.</Text>
            <Text style={{color: "gray"}}>일촌에게 메시지를 보내보세요.</Text>
        </View>
    )
}