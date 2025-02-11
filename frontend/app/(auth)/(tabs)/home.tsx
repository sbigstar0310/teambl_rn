import { Button, FlatList, ScrollView, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { sharedStyles } from "@/app/_layout";
import Header from "@/components/Header";
import PostCard from "@/components/cards/PostCard";
import { mockPost1, mockPost2 } from "@/shared/mock-data";

import fetchPostList from "@/libs/apis/Post/fetchPost";

import { router } from "expo-router";
import { USER_ID } from "@/shared/constants";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getCurrentUserId } from "@/shared/utils";
import PostInProjectPreview from "@/components/PostInProjectPreview";

const mockPosts = [mockPost1, mockPost2];

export default function HomeScreen() {
    const [posts, setPosts] = useState<api.Post[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
        fetchCurrentUserID();
    }, []);

    const fetchPosts = () => {
        setPosts(mockPosts);
    };

    const fetchCurrentUserID = async () => {
        setCurrentUserId(await getCurrentUserId());
    };

    // You can use fetchPosts function below! (API is connected.)

    // const fetchPosts = async () => {
    //     try {
    //         const fetchedPosts = await fetchPostList();
    //         console.log("fetch post:", fetchedPosts);
    //         setPosts(fetchedPosts);
    //     } catch (error) {
    //         console.error("Failed to fetch posts:", error);
    //     }
    // };

    return (
        <>
            <Header />
            <View
                style={[
                    sharedStyles.container,
                    {
                        backgroundColor: "#EEF4FF",
                        padding: 16,
                    },
                ]}
            >
                {/* Comment / Remove the following ScrollView to see the PostCard views only */}
                <ScrollView
                    style={{
                        width: "100%",
                    }}
                >
                    <Text>Home Screen</Text>
                    <Button
                        title="Go to RPS"
                        onPress={() => router.push("/resetPasswordSuccess")}
                    />
                    <Button
                        title="Go to Notification"
                        onPress={() => router.push("/notification")}
                    />
                    <Button
                        title="Go to Settings"
                        onPress={() => router.push("/settings")}
                    />
                    <Button
                        title="Go to Profile"
                        onPress={() => router.push("/profiles")}
                    />
                    <Button
                        title="Go to Search"
                        onPress={() => router.push("/search")}
                    />
                    <Button
                        title="Go to Messages Inbox"
                        onPress={() => router.push("/conversations")}
                    />
                    <Button
                        title="Go to oneChon"
                        onPress={() =>
                            router.push({
                                pathname: "/oneChon",
                                params: {
                                    target_user_id_string: currentUserId,
                                },
                            })
                        }
                    />
                    <Button
                        title="Go to Login"
                        onPress={() => router.push("/onboarding")}
                    />
                    <Button
                        title="Go to Signup"
                        onPress={() => router.push("/signupOnboarding")}
                    />
                    <Button
                        title="Logout"
                        onPress={() => router.push("/logout")}
                    />
                </ScrollView>

                <FlatList
                    contentContainerStyle={{
                        gap: 20,
                        padding: 2,
                    }}
                    data={posts}
                    renderItem={({ item, index }) => (
                        <PostInProjectPreview
                            key={index}
                            postInfo={item}
                            myId={currentUserId}
                        />
                    )}
                />
            </View>
        </>
    );
}
