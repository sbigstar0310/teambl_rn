import {Image, Text, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import {router, useLocalSearchParams} from "expo-router";
import ScreenHeader from "@/components/common/ScreenHeader";
import {useEffect, useState} from "react";
import {mockConversation1} from "@/shared/mock-data";
import {combineUserDetails, shorten} from "@/shared/utils";
import Popup from "@/components/Popup";

export default function Conversation() {
    const {id} = useLocalSearchParams();
    const [conversation, setConversation] = useState<api.Conversation>();
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    useEffect(() => {
        // TODO: fetch conversation data from api
        setConversation(mockConversation1);
    }, []);

    const handleExitButtonPress = () => setIsPopupVisible(true);
    const handleExit = () => {
        // TODO: make api to request and exit the chat
        router.back();
    }

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader
                title={() => <ConversationHeaderTitle conversation={conversation}/>}
                actionButton={() => <ExitConversationButton onPress={handleExitButtonPress}/>}
            />
            <View>
                {/*    Messages list */}
                {/*    Input */}
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