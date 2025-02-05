import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import EllipsisIcon from '@/assets/ellipsis-icon.svg';
import {useState} from "react";
import {shorten} from "@/shared/utils";
import Avatar from "@/components/common/Avatar";
import {sharedStyles} from "@/app/_layout";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {router} from "expo-router";

interface PostCardProps {
    post: api.Post;
}

export default function PostCard(props: PostCardProps) {
    const title = props.post.title;
    const content = shorten(props.post.content, 100);
    const createdDate = props.post.created_at.toLocaleDateString('ru-RU', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    });
    const authorAvatarUrl = props.post.user.profile.image;
    const authorName = props.post.user.profile.user_name;
    const authorRelation = props.post.user.profile.one_degree_count;
    const likeCount = props.post.like_count;

    // Indicates whether context menu is open or not (activated by pressing more button)
    const [isContextOpen, setIsContextOpen] = useState(false);

    const handleContextOpen = () => {
        setIsContextOpen(true);
    }

    const handleLike = () => {
    }

    const handleComment = () => {
    }

    const goToAuthorProfile = () => {
        router.push(`/profiles/${props.post.user.id}`);
    }

    const goToDetailedPostView = () => {
        router.push(`/posts/${props.post.id}`);
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={goToDetailedPostView}
        >
            {/*    Header */}
            <View style={styles.header}>
                <View>
                    {/* Title */}
                    <Text style={sharedStyles.primaryText}>{title}</Text>
                    {/* Members' avatars */}
                </View>
                <TouchableOpacity onPress={handleContextOpen}>
                    <EllipsisIcon width={20} height={20}/>
                </TouchableOpacity>
            </View>
            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.textContent}>{content}</Text>
                <Text style={sharedStyles.secondaryText}>{createdDate}</Text>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.author} onPress={goToAuthorProfile}>
                        {/* Author avatar */}
                        <Avatar imageURL={authorAvatarUrl} size={24}/>
                        {/* Author name */}
                        <Text style={styles.textAuthorName}>{authorName}</Text>
                        {/* Author relation */}
                        <Text style={sharedStyles.secondaryText}>・{authorRelation}촌</Text>
                    </TouchableOpacity>
                    <View style={styles.reactions}>
                        {/* Likes */}
                        <TouchableOpacity style={styles.reaction} onPress={handleLike}>
                            <FontAwesome6 name="heart" size={20} color="#595959"/>
                            <Text style={styles.textReaction}>{likeCount}</Text>
                        </TouchableOpacity>
                        {/* Comments */}
                        <TouchableOpacity style={styles.reaction} onPress={handleComment}>
                            <FontAwesome6 name="comment" size={20} color="#595959"/>
                            <Text style={styles.textReaction}>0</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        boxShadow: [{
            offsetX: 0,
            offsetY: 2,
            color: "#00000073",
            blurRadius: 1,
            spreadDistance: 0
        }]
    },
    header: {
        backgroundColor: 'white',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    content: {
        backgroundColor: '#F5F5F5',
        padding: 20,
        gap: 4
    },
    footer: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    author: {
        flexDirection: "row",
        alignItems: "center"
    },
    reactions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    reaction: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    textContent: {
        fontSize: 16,
        color: '#121212'
    },
    textAuthorName: {
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 8
    },
    textReaction: {
        color: "#595959"
    }
});
