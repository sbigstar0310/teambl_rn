import {Image, Text, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import {useLocalSearchParams} from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import {useEffect, useState} from "react";
import {mockConversation1} from "@/shared/mock-data";
import {combineUserDetails, shorten} from "@/shared/utils";

export default function Conversation() {
    const {id} = useLocalSearchParams();
    const [conversation, setConversation] = useState<api.Conversation>();

    useEffect(() => {
        // TODO: fetch conversation data from api
        setConversation(mockConversation1);
    }, []);

    const handleExit = () => {
    }

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader
                title={() => <ConversationHeaderTitle conversation={conversation}/>}
                actionButton={() => <ExitConversationButton onPress={handleExit}/>}
            />
            <View>
                {/*    Messages list */}
                {/*    Input */}
            </View>
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