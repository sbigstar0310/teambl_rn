import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Avatar from "@/components/common/Avatar";
import {timeAgo} from "@/shared/utils";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import theme from "@/shared/styles/theme";
import {sharedStyles} from "@/app/_layout";
import {useEffect, useMemo, useState} from "react";
import BottomModal from "@/components/BottomModal";
import Popup from "@/components/Popup";
import getUserInfo from "@/libs/apis/User/getUserInfo";

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
    // Sort the sub comments to show oldest first
    thread.sub.sort((a, b) => a.comment.created_at.getTime() - b.comment.created_at.getTime());
    return thread;
}

interface CommentThreadProps {
    thread: Thread;
    onReply: (parentCommentId: number) => void;
    onEdit: (commentId: number) => void;
    onDelete: (commentId: number) => void;
    myUserId: number;
}

export default function CommentThread(props: CommentThreadProps) {
    const comment = useMemo(() => props.thread.comment, [props.thread]);
    const isMyComment = useMemo(() => comment.user === props.myUserId, [comment, props.myUserId]);
    const [user, setUser] = useState<api.User>();

    const [isContextOpen, setIsContextOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        if (!comment?.user) return;
        fetchUser(comment.user);
    }, [comment]);

    const fetchUser = async (userId: number) => {
        try {
            const userData = await getUserInfo(userId);
            setUser(userData);
        } catch (error) {
            console.error("Failed to comment user:", error);
        }
    }

    const toggleHidden = () => {
        setIsHidden((isHidden) => !isHidden);
    }

    const handleEdit = () => {
        setIsContextOpen(false);
        props.onEdit(comment.id);
    }

    const handleDelete = () => {
        setIsContextOpen(false);
        props.onDelete(comment.id);
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
                            {...props}
                            thread={subThread}
                        />
                    )))}
                </View>
            )}
            <BottomModal
                visible={isContextOpen}
                onClose={setIsContextOpen.bind(null, false)}
                body={isMyComment
                    ? <MyOptions onEdit={handleEdit} onDelete={handleDelete}/>
                    : <Options/>}
                heightPercentage={0.2}
            />
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

interface MyOptionsProps {
    onEdit: () => void;
    onDelete: () => void;
}

function MyOptions(props: MyOptionsProps) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleDeletePress = () => {
        setIsPopupOpen(true);
    }

    return (
        <View style={styles.optionsContainer}>
            <View style={styles.optionButtonWrapper}>
                <TouchableOpacity
                    style={[styles.optionButton, {borderColor: theme.colors.black}]}
                    onPress={props.onEdit}
                >
                    <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.black}/>
                </TouchableOpacity>
                <Text style={{color: theme.colors.black}}>수정</Text>
            </View>
            <View style={styles.optionButtonWrapper}>
                <TouchableOpacity
                    style={[styles.optionButton, {borderColor: theme.colors.message2}]}
                    onPress={handleDeletePress}
                >
                    <Feather name="trash-2" size={24} color={theme.colors.message2}/>
                </TouchableOpacity>
                <Text style={{color: theme.colors.message2}}>삭제</Text>
            </View>
            <Popup
                title="댓글을 정말 삭제하시겠습니까?"
                isVisible={isPopupOpen}
                onClose={setIsPopupOpen.bind(null, false)}
                closeLabel="댓글 삭제"
                onConfirm={props.onDelete}
                confirmLabel="삭제"
                confirmLabelColor={theme.colors.point}
            />
        </View>
    )
}

function Options() {
    const handleReport = () => {

    }

    return (
        <View style={styles.optionsContainer}>
            <View style={styles.optionButtonWrapper}>
                <TouchableOpacity
                    style={[styles.optionButton, {borderColor: theme.colors.message2}]}
                    onPress={handleReport}
                >
                    <AntDesign name="warning" size={24} color={theme.colors.message2}/>
                </TouchableOpacity>
                <Text style={{color: theme.colors.message2}}>신고</Text>
            </View>
        </View>
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
    },
    optionsButtonContainer: {
        paddingLeft: 24
    },
    optionsContainer: {
        flex: 1,
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "space-evenly"
    },
    optionButton: {
        padding: 12,
        borderRadius: 999,
        borderWidth: 1
    },
    optionButtonWrapper: {
        alignItems: "center",
        gap: 4
    }
})