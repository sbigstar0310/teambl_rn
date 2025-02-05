import {useLocalSearchParams} from "expo-router";
import {StyleSheet, Text, View} from "react-native";
import ScreenHeader from "@/components/common/ScreenHeader";
import {sharedStyles} from "@/app/_layout";
import {useEffect, useState} from "react";
import {mockPost1} from "@/shared/mock-data";
import PrimeButton from "@/components/PrimeButton";
import dayjs from "dayjs";
import PostContent from "@/components/PostContent";

export default function PostView() {
    const {id} = useLocalSearchParams();
    const [postData, setPostData] = useState<api.Post>();

    useEffect(() => {
        // TODO: Fetch post by ID
        setPostData(mockPost1);
    }, []);

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader/>
            <View style={styles.main}>
                {/* Project details */}
                <View style={[styles.projectRow, sharedStyles.horizontalPadding]}>
                    <View style={styles.projectDetails}>
                        {/* Project title */}
                        <Text>{postData?.title ?? ""}</Text>
                        {/* Related user profiles */}
                        <Text>Avatars</Text>
                    </View>
                    {/* Subscribe button */}
                    <View>
                        <PrimeButton
                            text={"+ 소식 받기"}
                            onClickCallback={async () => {
                            }}
                            isActive={false}
                            isLoading={false}
                        />
                    </View>
                </View>
                {/* (optional) Images */}
                <View style={[styles.postContent, sharedStyles.horizontalPadding]}>
                    {/* Post Content */}
                    {postData?.content ?
                        <PostContent
                            content={postData.content}
                            taggedUsers={postData.tagged_users}
                        />
                        :
                        <Text>No content</Text>
                    }
                    {/* Date */}
                    <Text
                        style={sharedStyles.secondaryText}
                    >
                        {postData?.created_at ? dayjs(postData.created_at).format("YYYY.MM.DD") : ""}
                    </Text>
                    {/* Likes, interactions */}
                    <View style={styles.interactions}>
                        <View style={styles.interactionStats}>
                            <Text>Likes</Text>
                            <Text>Comments</Text>
                        </View>
                        <Text>Context menu</Text>
                    </View>
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
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    projectRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10
    },
    projectDetails: {
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    postContent: {
        paddingVertical: 10
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
