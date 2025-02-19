import theme from "@/shared/styles/theme";
import React, {useEffect, useMemo, useState} from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import EmptyComment from "@/assets/CommentEmptyIcon.svg";
import ThreeDots from "@/assets/ThreeDotsVerticalSM.svg";
import {router} from "expo-router";
import PostBottomModal from "./PostBottomModal";
import PostImages from "@/components/post/PostImages";
import toggleLikePost from "@/libs/apis/Post/toggleLikePost";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import fetchComment from "@/libs/apis/Comment/fetchComment";

interface PostInProjectPreviewProps {
    postInfo: api.Post;
    myId: number;
    onPostDelete?: () => void;
}

const PostInProjectPreview = (props: PostInProjectPreviewProps) => {
    const {postInfo, myId} = props;
    const images = postInfo?.images || [];
    const [isOptionVisible, setIsOptionVisible] = useState(false);
    const [commentsData, setCommentsData] = useState<api.Comment[]>([]);
    const isLikedByMe = useMemo(() => {
        if (!postInfo.liked_users || !postInfo.liked_users.length) return false;
        return postInfo.liked_users.includes(myId as any);
    }, [postInfo.liked_users, myId]);

    useEffect(() => {
        if (!postInfo.id) return;
        fetchComments(postInfo.id);
    }, [postInfo]);

    const fetchComments = async (postId: number) => {
        try {
            const commentsData = await fetchComment({post_id: postId});
            setCommentsData(commentsData);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
    }

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        const year = date.getFullYear().toString().slice(-2); // 연도의 마지막 두 자리
        const month = String(date.getMonth() + 1).padStart(2, "0"); // 월 (0부터 시작하므로 +1)
        const day = String(date.getDate()).padStart(2, "0"); // 일

        return `${year}.${month}.${day}`;
    };

    const goToDetailedPostView = () => {
        router.push(`/posts/${postInfo.id}`);
    };

    const handleToggleLike = async () => {
        try {
            await toggleLikePost(postInfo.id, myId);
        } catch (error) {
            console.log("Failed to toggle like:", error);
        }
    };

    return (
        <View
            style={[styles.container, images.length > 0 ? {padding: 0} : {}]}
        >
            {/** when image exists */}
            {images.length > 0 && (
                <TouchableOpacity onPress={goToDetailedPostView}>
                    <View style={styles.imageContainer}>
                        <PostImages images={images}/>
                    </View>
                </TouchableOpacity>
            )}
            {/** content area */}
            <View
                style={[
                    styles.contentContainer,
                    images.length > 0 ? {padding: 16} : {},
                ]}
            >
                {/** content */}
                <TouchableOpacity
                    onPress={goToDetailedPostView}
                    style={{width: "100%"}}
                >
                    <View style={styles.contentTextContainer}>
                        <Text
                            style={styles.contentText}
                            numberOfLines={3}
                            ellipsizeMode="tail"
                        >
                            {postInfo?.content}
                        </Text>
                    </View>
                </TouchableOpacity>
                {/** date */}
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                        {formatDate(postInfo?.created_at)}
                    </Text>
                </View>
                {/** footer */}
                <View style={styles.footerContainer}>
                    {/** likes and comments */}
                    <TouchableOpacity
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                        onPress={handleToggleLike}
                    >
                        {isLikedByMe
                            ? <FontAwesome name="heart" size={20} color={theme.colors.achromatic01}/>
                            : <FontAwesome name="heart-o" size={20} color={theme.colors.achromatic01}/>}
                        <Text style={styles.footerText}>
                            {postInfo?.like_count}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            marginLeft: 10,
                        }}
                        onPress={goToDetailedPostView}
                    >
                        <EmptyComment/>
                        <Text style={styles.footerText}>
                            {commentsData.length}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsOptionVisible(true)}
                        style={{marginLeft: "auto", paddingLeft: 15}}
                    >
                        <ThreeDots/>
                    </TouchableOpacity>
                </View>
            </View>
            {/** option */}
            <PostBottomModal
                visible={isOptionVisible}
                onClose={() => setIsOptionVisible(false)}
                isMyPost={`${postInfo?.user}` === `${myId}`}
                postId={postInfo?.id}
                projectId={(postInfo?.project_card as any) as number}
                onDelete={props.onPostDelete}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderRadius: 5,
        padding: 16,
        backgroundColor: theme.colors.achromatic06,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    contentText: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        fontWeight: 400,
    },
    dateContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 4,
    },
    dateText: {
        fontSize: theme.fontSizes.caption,
        fontWeight: 400,
        color: theme.colors.achromatic01,
    },
    contentTextContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        flexWrap: "wrap",
    },
    footerContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 16,
    },
    footerText: {
        fontSize: theme.fontSizes.body2,
        fontWeight: 400,
        color: theme.colors.achromatic01,
        marginLeft: 4,
    },
    imageContainer: {
        width: "100%",
        height: 150,
        borderRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: "hidden",
        flexDirection: "row",
    },
    singleImage: {
        flex: 1,
        resizeMode: "cover",
    },
    twoImageWrapper: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
    },
    threeImageWrapper: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
    },
    leftImage: {
        flex: 1,
        resizeMode: "cover",
    },
    rightColumn: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    flexImage: {
        flex: 1,
        resizeMode: "cover",
    },
    imageSpacingRight: {
        marginRight: 4,
    },
    imageSpacingBottom: {
        marginBottom: 4,
    },
});

export default PostInProjectPreview;
