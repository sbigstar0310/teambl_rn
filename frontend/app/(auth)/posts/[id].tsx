import {useLocalSearchParams} from "expo-router";
import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import ScreenHeader from "@/components/common/ScreenHeader";
import {sharedStyles} from "@/app/_layout";
import {useEffect, useState} from "react";
import {mockComment1, mockComment2, mockPost1, mockProject1, mockUser1, mockUser2} from "@/shared/mock-data";
import dayjs from "dayjs";
import PostContent from "@/components/PostContent";
import ProjectDetailsInPost from "@/components/post/ProjectDetailsInPost";
import PostInteractions from "@/components/post/PostInteractions";
import CommentDummyInput from "@/components/post/CommentDummyInput";
import PostComment from "@/components/post/PostComment";
import theme from "@/shared/styles/theme";

export default function PostView() {
    const {id} = useLocalSearchParams();
    const [me, setMe] = useState<api.User>();
    const [postData, setPostData] = useState<api.Post>();
    const [projectData, setProjectData] = useState<api.ProjectCard>();
    const [authorData, setAuthorData] = useState<api.User>();
    const [commentsData, setCommentsData] = useState<api.Comment[]>([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isContextOpen, setIsContextOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<api.Comment | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        // TODO: fetch current authenticated user data
        setMe(mockUser1);
    }, []);
    useEffect(() => {
        // TODO: Fetch post by ID
        setPostData(mockPost1);
    }, [id]);
    useEffect(() => {
        // TODO: fetch project, author data, comments by post id
        setProjectData(mockProject1);
        setAuthorData(mockUser1);
        setCommentsData([
            mockComment1,
            mockComment2
        ])
    }, [postData]);

    const handleSubscribe = () => {
        // TODO: make api call to subscribe to project
        setIsSubscribed(true);
        console.log('Subscribed')
    }

    const handleLike = () => {
        // TODO: make api call to like post
        console.log('Liked')
    }

    const handleCommentSubmit = () => {
        // TODO: make api call to submit comment
        if (!postData || !me) return;
        console.log('Comment submitted')
        console.log(commentText);
        setCommentsData((comments) => {
            const lastId = comments.length > 0
                ? comments[comments.length - 1].id
                : 1;
            const newComment: api.Comment = {
                id: lastId + 1,
                post: postData.id,
                user: me.id,
                content: commentText,
                created_at: new Date(),
                likes: 0,
                parent_comment: replyingTo ? replyingTo.id : undefined
            }
            return [...comments, newComment];
        })
        setReplyingTo(null);
        setIsInputFocused(false);
    }

    const handleInputFocus = (comment?: api.Comment) => {
        if (comment) {
            // Reply to another comment
            setReplyingTo(comment);
        } else {
            // New comment
            setReplyingTo(null);
        }
        setIsInputFocused(true);
    }

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader/>
            {postData &&
                <View style={styles.main}>
                    {/* Project details */}
                    {projectData &&
                        <ProjectDetailsInPost
                            project={projectData}
                            post={postData}
                            onSubscribe={handleSubscribe}
                            isSubscribed={isSubscribed}
                        />
                    }
                    {/* (optional) Images */}
                    {/* Post Content */}
                    <View style={[styles.postContent, sharedStyles.horizontalPadding]}>
                        <PostContent
                            content={postData.content}
                            taggedUsers={postData.tagged_users}
                        />
                        {/* Date */}
                        <Text
                            style={sharedStyles.secondaryText}
                        >
                            {postData?.created_at ? dayjs(postData.created_at).format("YYYY.MM.DD") : ""}
                        </Text>
                        {/* Likes, interactions */}
                        <PostInteractions
                            likes={postData.like_count}
                            comments={0}
                            onOptions={setIsContextOpen.bind(null, true)}
                            onLike={handleLike}
                            onComment={handleInputFocus}
                        />
                    </View>
                    {/* Comment input */}
                    {me && <CommentDummyInput
                        user={me}
                        onModalOpen={handleInputFocus}
                    />}
                    {/* Comments thread */}
                    <View style={sharedStyles.horizontalPadding}>
                        {commentsData.map((commentData, index) =>
                            <PostComment
                                key={index}
                                comment={commentData}
                                user={mockUser2}
                                onReply={handleInputFocus}
                            />)}
                    </View>
                </View>
            }
            <Modal
                visible={isInputFocused}
                onRequestClose={setIsInputFocused.bind(null, false)}
                transparent={true}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="댓글 작성하기..."
                            autoFocus={true}
                            multiline={true}
                            numberOfLines={3}
                            onChangeText={setCommentText}
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleCommentSubmit}
                        >
                            <Text style={styles.submitButtonText}>댓글 추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    postContent: {
        paddingVertical: 24,
        gap: 8
    },
    interactions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    interactionStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.white
    },
    input: {
        flexGrow: 1,
        padding: 16,
        // minHeight: 50,
        width: "80%"
    },
    submitButton: {
        padding: 8,
        width: "20%"
    },
    submitButtonText: {
        color: theme.colors.main,
        fontSize: 14
    }
})
