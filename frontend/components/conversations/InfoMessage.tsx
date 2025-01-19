import {MessageEntity} from "@/shared/utils";
import {StyleSheet, Text, View} from "react-native";

interface InfoMessageProps {
    entity: Exclude<MessageEntity, { type: "message", data: api.Message }>;
}

export default function InfoMessage(props: InfoMessageProps) {
    const text = props.entity.type === "date" ? (
        props.entity.data.toLocaleDateString("en-US", {dateStyle: "medium"})
    ) : (
        props.entity.data.message
    );

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 1,
        justifyContent: "center"
    },
    text: {
        textAlign: "center",
        color: "#595959",
        fontSize: 12,
        fontWeight: 600
    }
})