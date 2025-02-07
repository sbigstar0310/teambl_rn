import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Avatar from "@/components/common/Avatar";
import {timeAgo} from "@/shared/utils";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import theme from "@/shared/styles/theme";
import {sharedStyles} from "@/app/_layout";
import {useState} from "react";

interface PostCommentProps {
    user: api.User;
    comment: api.Comment;
    onReply: (comment: api.Comment) => void;
}

export default function PostComment(props: PostCommentProps) {
    const [isContextOpen, setIsContextOpen] = useState(false);

    return (
        <View style={styles.container}>
            {/* Avatar */}
            <Avatar
                imageURL={props.user.profile.image}
                size={28}
            />
            {/* Details */}
            <View style={styles.detailsContainer}>
                <View style={styles.header}>
                    {/* Author */}
                    <Text style={[sharedStyles.primaryText, {fontSize: 14}]}>
                        {props.user.profile.user_name}
                    </Text>
                    {/* Time since comment date */}
                    <Text style={sharedStyles.secondaryText}>
                        {timeAgo(props.comment.created_at)}
                    </Text>
                </View>
                {/* Content */}
                <Text style={styles.contentText}>
                    {props.comment.content}
                </Text>
                {/* Action button (reply) */}
                <TouchableOpacity
                    onPress={props.onReply.bind(null, props.comment)}
                >
                    <Text style={sharedStyles.secondaryText}>
                        답글 달기
                    </Text>
                </TouchableOpacity>
            </View>
            {/* Options */}
            <TouchableOpacity
                onPress={setIsContextOpen.bind(null, true)}
                style={styles.optionsButtonContainer}
            >
                <FontAwesome6
                    name="ellipsis-vertical"
                    size={15}
                    color={theme.colors.achromatic03}
                />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 8,
        paddingVertical: 10
    },
    detailsContainer: {
        flexGrow: 1,
        gap: 4
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 4
    },
    contentText: {
        color: theme.colors.black
    },
    optionsButtonContainer: {
        paddingLeft: 24
    }
})