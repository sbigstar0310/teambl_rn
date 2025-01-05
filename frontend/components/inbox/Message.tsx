import {StyleSheet, Text, View} from "react-native";
import TickIcon from '@/assets/tick-icon.svg';
import {sharedStyles} from "@/app/_layout";

interface MessageProps {
    isSentByMe: boolean;
    message: api.Message
}

export default function Message(props: MessageProps) {
    const text = props.message.message;
    const isUnread = !props.message.is_read;
    const time = props.message.created_at.toLocaleTimeString("ko", {
        // hour12: false, /* Uncomment if you want to see the time in 24h format */
        hour: "numeric",
        minute: "2-digit",
    })

    return (
        <View style={[styles.container, props.isSentByMe && styles.byMeContainer]}>
            {/* Text display box */}
            <View style={[styles.textbox, props.isSentByMe && styles.byMeTextbox]}>
                <Text>{text}</Text>
            </View>
            {/* Extra Details */}
            {/* Time */}
            <Text style={sharedStyles.secondaryText}>{time}</Text>
            {/* Unread indicator */}
            {isUnread && !props.isSentByMe && <TickIcon/>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 4
    },
    byMeContainer: {
        flexDirection: "row-reverse"
    },
    textbox: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#F5F5F5"
    },
    byMeTextbox: {
        backgroundColor: "#EEF4FF"
    }
})