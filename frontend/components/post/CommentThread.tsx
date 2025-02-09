import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Avatar from "@/components/common/Avatar";
import {timeAgo} from "@/shared/utils";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import theme from "@/shared/styles/theme";
import {sharedStyles} from "@/app/_layout";
import {useEffect, useMemo, useState} from "react";
import {mockUser2} from "@/shared/mock-data";

export type Thread = {
    comment: api.Comment;
    sub: Thread[];
}

export const getThread = (comment: api.Comment, otherComments: api.Comment[]) => {
    const thread: Thread = {
        comment,
        sub: []
    }
    const subComments = otherComments.filter(c => c.parent_comment === comment.id);
    for (const subComment of subComments) {
        const subOtherComments = otherComments.filter(c => c.id !== subComment.id);
        thread.sub.push(getThread(subComment, subOtherComments));
    }
    // Sort the sub comments to show latest first
    thread.sub.sort((a, b) => b.comment.created_at.getTime() - a.comment.created_at.getTime());
    return thread;
}

interface CommentThreadProps {
    thread: Thread;
    onReply: (parentCommentId: number) => void;
}

export default function CommentThread(props: CommentThreadProps) {
    const comment = useMemo(() => props.thread.comment, [props.thread]);
    const [user, setUser] = useState<api.User>();

    const [isContextOpen, setIsContextOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        // TODO: fetch user data by comment author id
        setUser(mockUser2);
    }, [comment]);

    const toggleHidden = () => {
        setIsHidden((isHidden) => !isHidden);
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {/* Avatar */}
                <Avatar
                    imageURL={user?.profile.image}
                    size={28}
                />
                {/* Details */}
                <View style={styles.detailsContainer}>
                    <View style={styles.header}>
                        {/* Author */}
                        <Text style={[sharedStyles.primaryText, {fontSize: 14}]}>
                            {user?.profile.user_name || ""}
                        </Text>
                        {/* Time since comment date */}
                        <Text style={sharedStyles.secondaryText}>
                            {timeAgo(comment.created_at)}
                        </Text>
                    </View>
                    {/* Content */}
                    <Text style={styles.contentText}>
                        {comment.content}
                    </Text>
                    {/* Action buttons (reply & hide/show) */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            onPress={props.onReply.bind(null, comment.id)}
                        >
                            <Text style={sharedStyles.secondaryText}>
                                답글 달기
                            </Text>
                        </TouchableOpacity>
                        {props.thread.sub.length > 0 && <ShowThreadButton hidden={isHidden} onToggle={toggleHidden}/>}
                    </View>
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
            {/* Sub comments */}
            {props.thread.sub.length > 0 && (
                <View style={styles.subContainer}>
                    {!isHidden && props.thread.sub.map(((subThread, index) => (
                        <CommentThread
                            key={index}
                            thread={subThread}
                            onReply={props.onReply}
                        />
                    )))}
                </View>
            )}
        </View>
    )
}

interface ShowThreadButtonProps {
    hidden: boolean;
    onToggle: () => void;
}

function ShowThreadButton(props: ShowThreadButtonProps) {
    return (
        <TouchableOpacity onPress={props.onToggle} style={styles.toggleButton}>
            <Text style={sharedStyles.secondaryText}>
                스레드 {props.hidden ? "보기" : "숨기기"}
            </Text>
            <AntDesign
                name={props.hidden ? "caretdown" : "caretup"}
                size={12}
                color={theme.colors.achromatic01}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%"
    },
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
    },
    subContainer: {
        paddingLeft: 32
    },
    toggleButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    }
})