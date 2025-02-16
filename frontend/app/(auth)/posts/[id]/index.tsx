import {router, useLocalSearchParams} from "expo-router";
import {
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import ScreenHeader from "@/components/common/ScreenHeader";
import {sharedStyles} from "@/app/_layout";
import React, {Fragment, useEffect, useMemo, useRef, useState} from "react";
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
import {SafeAreaView} from "react-native-safe-area-context";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import BottomModal from "@/components/BottomModal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import updateComment from "@/libs/apis/Comment/CommentUpdate";
import deleteComment from "@/libs/apis/Comment/CommentDelete";
import Popup from "@/components/Popup";
import deletePost from "@/libs/apis/Post/deletePost";
import * as Clipboard from "expo-clipboard";
import {createLinkToPost} from "@/shared/utils";
import PostImages from "@/components/post/PostImages";
import ReportCreateForm from "@/components/forms/ReportCreateForm";

export default function PostView() {
    const {id} = useLocalSearchParams();
    const [me, setMe] = useState<api.User>();
    const [postData, setPostData] = useState<api.Post>();
    const [taggedUsers, setTaggedUsers] = useState<api.User[]>([]);
    const [projectData, setProjectData] = useState<api.ProjectCard>();
    const [authorData, setAuthorData] = useState<api.User>();
    const [commentsData, setCommentsData] = useState<api.Comment[]>([]);
    const [threadData, setThreadData] = useState<Thread[]>([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isContextOpen, setIsContextOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [editingComment, setEditingComment] = useState<number | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [commentText, setCommentText] = useState("")
    const [loading, setLoading] = useState(true);
    const [isHeaderShown, setIsHeaderShown] = useState(false);
    const containerRef = useRef<ScrollView | null>(null)
    const isMyPost = useMemo(() => {
        if (!me || !authorData) return false;
        return me.id === authorData.id;
    }, [me, authorData]);

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
        fetchProjectCard((postData.project_card as any) as number);
        fetchUser((postData.user as any) as number);
        fetchComments(postData.id);
        fetchTaggedUsers((postData.tagged_users as any) as number[]);
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
            setLoading(true);
            const currentUser = await fetchCurrentUserAPI();
            setMe(currentUser ?? undefined);
        } catch (error) {
            console.error("Failed to fetch current user", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchPost = async (postId: number) => {
        try {
            setLoading(true);
            const postData = await fetchPostById(postId);
            setPostData(postData);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchProjectCard = async (projectId: number) => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }
    const fetchUser = async (userId: number) => {
        try {
            setLoading(true);
            const userData = await getUserInfo(userId);
            setAuthorData(userData);
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    }
    const fetchComments = async (postId: number) => {
        try {
            setLoading(true);
            const commentsData = await fetchComment({post_id: postId});
            setCommentsData(commentsData);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setLoading(false);
        }
    }
    const fetchTaggedUsers = async (userIds: number[]) => {
        try {
            const usersData = await Promise.all(
                userIds.map(id => getUserInfo(id)));
            setTaggedUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch tagged users:", error);
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
    const handleLike = async (postId: number) => {
        try {
            if (!postId || !me?.id) return; // postId 또는 me.id가 없으면 실행 안 함
            await toggleLikePost(postId, me.id);
            await fetchPost(postId);
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };
    const handleCommentSubmit = async () => {
        if (!postData || !me || !commentText.trim()) return; // 유효성 검사
        try {
            if (editingComment) {
                // Edit existing comment content
                await updateComment({comment_id: editingComment, content: commentText});
            } else {
                // Create new comment
                // API 호출하여 새로운 댓글 생성
                await createComment({
                    post_id: postData.id,
                    content: commentText,
                    parent_comment: replyingTo ?? undefined,  // 대댓글 여부 확인
                });
            }
            if (replyingTo == null) {
                // 스크롤을 최신 댓글로 이동
                containerRef.current?.scrollToEnd();
            }
            // 입력 필드 초기화
            handleInputUnfocus();
            await fetchComments(postData.id);
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    };
    const handleCommentDelete = async (commentId: number) => {
        if (!commentId || !postData || !me) return;
        try {
            // 댓글 삭제 API 호출
            await deleteComment({comment_id: commentId});
            await fetchComments(postData.id);
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    }
    const handleCommentEdit = (commentId: number) => {
        setEditingComment(commentId);
        setCommentText(commentsData.find(c => c.id === commentId)?.content ?? "");
        handleInputFocus();
    }

    const handlePostDelete = async () => {
        if (!postData) return;
        setIsContextOpen(false);
        try {
            await deletePost(postData.id);
            router.back();
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    }
    const handlePostEdit = () => {
        if (!postData || !projectData) return;
        setIsContextOpen(false);
        router.push({
            pathname: `/posts/${postData.id}/edit`,
            params: {
                project_title: projectData.title
            }
        });
    }

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
    const handleInputUnfocus = () => {
        setReplyingTo(null);
        setEditingComment(null);
        setIsInputFocused(false);
        setCommentText("");
    }
    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Adjust dynamic header visibility based on scroll position
        const scrollY = e.nativeEvent.contentOffset.y;
        const headerHeight = 50;
        const headerShown = scrollY > headerHeight;
        if (headerShown !== isHeaderShown) {
            setIsHeaderShown(headerShown);
        }
    }

    return (
        <SafeAreaView style={sharedStyles.container} edges={["top"]}>
            <LoadingOverlay isLoading={loading}/>
            <ScreenHeader
                actionButton={() => isHeaderShown && projectData && postData &&
                    <ProjectDetailsInPost
                        project={projectData}
                        post={postData}
                        taggedUsers={taggedUsers}
                        onSubscribe={() => handleSubscribe(projectData?.id ?? 0)}
                        isSubscribed={isSubscribed}
                        isOnHeader={true}
                    />}
            />
            {postData &&
                <Fragment>
                    <ScrollView
                        style={styles.main}
                        showsVerticalScrollIndicator={false}
                        ref={containerRef}
                        refreshControl={<RefreshControl
                            refreshing={false}
                            onRefresh={() => {
                                fetchPost(postData.id);
                                fetchComments(postData.id);
                            }}
                        />}
                        onScroll={handleScroll}
                    >
                        {/* Project details */}
                        {projectData &&
                            <ProjectDetailsInPost
                                project={projectData}
                                post={postData}
                                taggedUsers={taggedUsers}
                                onSubscribe={() => handleSubscribe(projectData?.id ?? 0)}
                                isSubscribed={isSubscribed}
                            />
                        }
                        {/* Post Content */}
                        <View style={[styles.postContent, sharedStyles.horizontalPadding]}>
                            <PostContent
                                content={postData.content}
                                taggedUsers={taggedUsers}
                            />
                            {/* Date */}
                            <Text
                                style={sharedStyles.secondaryText}
                            >
                                {postData?.created_at ? dayjs(postData.created_at).format("YYYY.MM.DD") : ""}
                            </Text>
                        </View>
                        {/* (optional) Images */}
                        {postData.images.length > 0 &&
                            <PostImages images={postData.images} previewEnabled={true}/>
                        }
                        {/* Likes, interactions */}
                        <View style={[styles.interactionsContainer, sharedStyles.horizontalPadding]}>
                            <PostInteractions
                                isLikedByMe={postData.liked_users.includes(me?.id as any ?? 0)}
                                likes={postData.like_count}
                                comments={commentsData.length}
                                onOptions={setIsContextOpen.bind(null, true)}
                                onLike={() => handleLike(postData?.id ?? 0)}
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
                                    projectId={projectData?.id ?? 0}
                                    thread={threadData}
                                    onReply={handleInputFocus}
                                    onEdit={handleCommentEdit}
                                    onDelete={handleCommentDelete}
                                    myUserId={me?.id || 0}
                                />)}
                        </View>
                    </ScrollView>
                    {/* Text input */}
                    <Modal
                        visible={isInputFocused}
                        onRequestClose={handleInputUnfocus}
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
                                    value={commentText}
                                    onChangeText={setCommentText}
                                />
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleCommentSubmit}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {editingComment === null ? "댓글 추가" : "댓글 수정"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    {/* Post Options */}
                    <BottomModal
                        visible={isContextOpen}
                        onClose={setIsContextOpen.bind(null, false)}
                        body={isMyPost
                            ? <MyOptions
                                onDelete={handlePostDelete}
                                onEdit={handlePostEdit}
                                postId={postData.id}
                            />
                            : <Options
                                postId={postData.id}
                                projectId={projectData?.id ?? 0}
                                userId={authorData?.id ?? 0}
                            />
                        }
                        heightPercentage={0.2}
                    />
                </Fragment>
            }
        </SafeAreaView>
    )
}

interface MyOptionsProps {
    postId: number;
    onDelete: () => void;
    onEdit: () => void;
}

function MyOptions(props: MyOptionsProps) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleCopyLink = async () => {
        try {
            await Clipboard.setStringAsync(
                createLinkToPost(props.postId)
            );
            alert("프로젝트 링크가 클립보드에 복사되었습니다!");
        } catch (error) {
            alert("링크를 복사하는 동안 오류가 발생했습니다.");
        }
    }

    return (
        <View style={styles.optionsContainer}>
            <View style={styles.optionButtonWrapper}>
                <TouchableOpacity
                    style={[styles.optionButton, {borderColor: theme.colors.black}]}
                    onPress={handleCopyLink}
                >
                    <Feather name="link" size={24} color={theme.colors.black}/>
                </TouchableOpacity>
                <Text style={{color: theme.colors.black}}>링크 복사</Text>
            </View>
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
                    onPress={setIsPopupOpen.bind(null, true)}
                >
                    <Feather name="trash-2" size={24} color={theme.colors.message2}/>
                </TouchableOpacity>
                <Text style={{color: theme.colors.message2}}>삭제</Text>
            </View>
            <Popup
                title="이 게시물을 삭제하시겠습니까?"
                isVisible={isPopupOpen}
                onClose={setIsPopupOpen.bind(null, false)}
                closeLabel="취소"
                closeLabelColor={theme.colors.point}
                onConfirm={props.onDelete}
                confirmLabel="게시물 삭제"
                confirmLabelColor={theme.colors.black}
            />
        </View>
    )
}

interface OptionsProps {
    postId: number;
    projectId: number;
    userId: number;
}

function Options(props: OptionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCopyLink = async () => {
        try {
            await Clipboard.setStringAsync(
                createLinkToPost(props.postId)
            );
            alert("프로젝트 링크가 클립보드에 복사되었습니다!");
        } catch (error) {
            alert("링크를 복사하는 동안 오류가 발생했습니다.");
        }
    }

    return (
        <View style={styles.optionsContainer}>
            <View style={styles.optionButtonWrapper}>
                <TouchableOpacity
                    style={[styles.optionButton, {borderColor: theme.colors.black}]}
                    onPress={handleCopyLink}
                >
                    <Feather name="link" size={24} color={theme.colors.black}/>
                </TouchableOpacity>
                <Text style={{color: theme.colors.black}}>링크 복사</Text>
            </View>
            <View style={styles.optionButtonWrapper}>
                <TouchableOpacity
                    style={[styles.optionButton, {borderColor: theme.colors.message2}]}
                    onPress={setIsModalOpen.bind(null, true)}
                >
                    <AntDesign name="warning" size={24} color={theme.colors.message2}/>
                </TouchableOpacity>
                <Text style={{color: theme.colors.message2}}>신고</Text>
            </View>
            <BottomModal
                heightPercentage={0.8}
                visible={isModalOpen}
                onClose={setIsModalOpen.bind(null, false)}
                body={<ReportCreateForm
                    onSubmit={setIsModalOpen.bind(null, false)}
                    related_post_id={props.postId}
                    related_project_card_id={props.projectId}
                    related_user_id={props.userId}
                />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        paddingVertical: 12
    },
    postContent: {
        paddingVertical: 16,
        gap: 8
    },
    interactionsContainer: {
        paddingVertical: 16
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
