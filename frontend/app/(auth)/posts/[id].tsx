import {useLocalSearchParams} from "expo-router";
import {Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import ScreenHeader from "@/components/common/ScreenHeader";
import {sharedStyles} from "@/app/_layout";
import {useEffect, useRef, useState} from "react";
import dayjs from "dayjs";
import PostContent from "@/components/PostContent";
import ProjectDetailsInPost from "@/components/post/ProjectDetailsInPost";
import PostInteractions from "@/components/post/PostInteractions";
import CommentDummyInput from "@/components/post/CommentDummyInput";
import CommentThread, {getThread, Thread} from "@/components/post/CommentThread";
import theme from "@/shared/styles/theme";
import fetchCurrentUserAPI from "@/libs/apis/User/currentUser";
import fetchPostById from "@/libs/apis/Post/fetchPostById";
import toggleLikePost from "@/libs/apis/Post/toggleLikePost";
import toggleBookmarkProjectCard from "@/libs/apis/ProjectCard/toggleBookmarkProjectCard";
import createComment from "@/libs/apis/Comment/CommentCreate";
import fetchMyProjectCard from "@/libs/apis/ProjectCard/fetchMyProjectCard";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import fetchComment from "@/libs/apis/Comment/fetchComment";

export default function PostView() {
    const {id} = useLocalSearchParams();
    const [me, setMe] = useState<api.User>();
    const [postData, setPostData] = useState<api.Post>();
    const [projectData, setProjectData] = useState<api.ProjectCard>();
    const [authorData, setAuthorData] = useState<api.User>();
    const [commentsData, setCommentsData] = useState<api.Comment[]>([]);
    const [threadData, setThreadData] = useState<Thread[]>([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isContextOpen, setIsContextOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [commentText, setCommentText] = useState("")
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<ScrollView | null>(null);

    useEffect(() => {
        fetchCurrentUser();
    }, []);
    useEffect(() => {
        if (id) {
            fetchPost(Number(id));
        }
    }, [id]);
    useEffect(() => {
        if (!postData) return;
        fetchProjectCard(postData.project_card);
        fetchUser(postData.user);
        fetchComments(postData.id);
    }, [postData]);
    useEffect(() => {
        const threads: Thread[] = commentsData
            .filter(c => !c.parent_comment)
            // Sort the comments to show oldest first
            .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
            .map(c => getThread(c, commentsData.filter(c2 => c2.id !== c.id)));
        setThreadData(threads);
    }, [commentsData]);
    useEffect(() => {
        if (!projectData || !me) return;
        setIsSubscribed(projectData.bookmarked_users.includes(me.id));
    }, [projectData, me]);

    // 현재 로그인한 유저 정보 불러오기
    const fetchCurrentUser = async () => {
        try {
            const currentUser = await fetchCurrentUserAPI();
            setMe(currentUser ?? undefined);
            console.log("fetched current user: ", currentUser);
        } catch (error) {
            console.error("Failed to fetch current user", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchPost = async (postId: number) => {
        try {
            const postData = await fetchPostById(postId);
            console.log("Fetched post:", postData);
            setPostData(postData);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        }
    };
    const fetchProjectCard = async (projectId: number) => {
        try {
            // TODO: use specific api route to get single project card data by id
            const projectCardsData = await fetchMyProjectCard();
            const projectCardData = projectCardsData.find(p => p.id === projectId);
            if (!projectCardData) {
                console.error("Project card not found");
                return;
            }
            setProjectData(projectCardData);
        } catch (error) {
            console.error("Failed to fetch project card:", error);
        }
    }
    const fetchUser = async (userId: number) => {
        try {
            const userData = await getUserInfo(userId);
            setAuthorData(userData);
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }
    const fetchComments = async (postId: number) => {
        try {
            const commentsData = await fetchComment({post_id: postId});
            setCommentsData(commentsData);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
    }

    const handleSubscribe = async (projectCardId: number) => {
        try {
            // 프로젝트 카드 북마크 토글 API 호출
            const updatedProjectData = await toggleBookmarkProjectCard({projectCardId});
            setProjectData(updatedProjectData);
        } catch (error) {
            console.error("Failed to toggle subscription:", error);
        }
    };
    const handleLike = async (postId: number, likedUsers: number[] = [], setPostData: (data: any) => void) => {
        try {
            if (!postId || !me?.id) return; // postId 또는 me.id가 없으면 실행 안 함
            const userId = me.id;
            const isLiked = likedUsers.includes(userId);
            const updatedLikedUsers = isLiked
                ? likedUsers.filter((id) => id !== userId) // 좋아요 취소
                : [...likedUsers, userId]; // 좋아요 추가
            const updatedPost = await toggleLikePost(postId, {liked_users: updatedLikedUsers});
            setPostData(updatedPost);
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };
    const handleCommentSubmit = async () => {
        if (!postData || !me || !commentText.trim()) return; // 유효성 검사
        try {
            // API 호출하여 새로운 댓글 생성
            const newComment = await createComment({
                post_id: postData.id,
                content: commentText,
                parent_comment: replyingTo ?? undefined,  // 대댓글 여부 확인
            });

            // 상태 업데이트: 기존 댓글 목록에 새 댓글 추가
            setCommentsData((prevComments) => [...prevComments, newComment]);

            console.log("Comment submitted:", newComment);

            if (replyingTo == null) {
                // 스크롤을 최신 댓글로 이동
                containerRef.current?.scrollToEnd();
            }

            // 입력 필드 초기화
            setReplyingTo(null);
            setIsInputFocused(false);
            setCommentText(""); // 댓글 입력 필드 초기화
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    };

    const handleInputFocus = (parentCommentId?: number) => {
        if (parentCommentId !== undefined) {
            // Reply to another comment
            setReplyingTo(parentCommentId);
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
                <ScrollView
                    style={styles.main}
                    showsVerticalScrollIndicator={false}
                    ref={containerRef}
                >
                    {/* Project details */}
                    {projectData &&
                        <ProjectDetailsInPost
                            project={projectData}
                            post={postData}
                            // onSubscribe={handleSubscribe}
                            onSubscribe={() => handleSubscribe(projectData?.id ?? 0)}
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
                            // onLike={handleLike}
                            onLike={() => handleLike(
                                postData?.id ?? 0,
                                postData?.liked_users?.map(user => user.id) ?? [],
                                setPostData
                            )}
                            onComment={() => handleInputFocus()}
                        />
                    </View>
                    {/* Comment input */}
                    {me && <CommentDummyInput
                        user={me}
                        onModalOpen={() => handleInputFocus()}
                    />}
                    {/* Comments thread */}
                    <View style={sharedStyles.horizontalPadding}>
                        {threadData.map((threadData, index) =>
                            <CommentThread
                                key={index}
                                thread={threadData}
                                onReply={handleInputFocus}
                                myUserId={me?.id || 0}
                            />)}
                    </View>
                </ScrollView>
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
