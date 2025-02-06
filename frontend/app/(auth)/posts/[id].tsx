import {useLocalSearchParams} from "expo-router";
import {StyleSheet, Text, TextInput, View} from "react-native";
import ScreenHeader from "@/components/common/ScreenHeader";
import {sharedStyles} from "@/app/_layout";
import {useEffect, useRef, useState} from "react";
import {mockPost1, mockProject1, mockUser1} from "@/shared/mock-data";
import dayjs from "dayjs";
import PostContent from "@/components/PostContent";
import ProjectDetailsInPost from "@/components/post/ProjectDetailsInPost";
import PostInteractions from "@/components/post/PostInteractions";

export default function PostView() {
    const {id} = useLocalSearchParams();
    const [postData, setPostData] = useState<api.Post>();
    const [projectData, setProjectData] = useState<api.ProjectCard>();
    const [authorData, setAuthorData] = useState<api.User>();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isContextOpen, setIsContextOpen] = useState(false);
    const commentInputRef = useRef<TextInput>(null);

    useEffect(() => {
        // TODO: Fetch post by ID
        setPostData(mockPost1);
    }, [id]);

    useEffect(() => {
        // TODO: fetch project, author data by post id
        setProjectData(mockProject1);
        setAuthorData(mockUser1);
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
                            onComment={commentInputRef.current?.focus}
                        />
                    </View>
                    {/* Comment input */}
                    <View style={sharedStyles.horizontalPadding}>
                        <Text>Comment input goes here</Text>
                    </View>
                    {/* Comments thread */}
                    <View style={sharedStyles.horizontalPadding}>
                        <Text>Comments THREAD go down here</Text>
                    </View>
                </View>
            }
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
    }
})
