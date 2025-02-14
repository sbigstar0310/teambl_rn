import { Button, FlatList, ScrollView, View, Text, StyleSheet } from "react-native";
import React, { Fragment, useEffect, useState } from "react";
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
import fetchOneDegreeProjectCard from "@/libs/apis/ProjectCard/fetchOneDegreeProjectCard";
import { useAuthStore } from "@/store/authStore";
import theme from "@/shared/styles/theme";
import ProjectPreview from "@/components/ProjectPreview";
import fetchMyProjectCard from "@/libs/apis/ProjectCard/fetchMyProjectCard";

const mockPosts = [mockPost1, mockPost2];

export default function HomeScreen() {
    const [projects, setProjects] = useState<api.ProjectCard[]>([]);
    const [posts, setPosts] = useState<api.Post[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const myId = useAuthStore.getState().user?.id || -99;

    if (myId === -99) {
        return (
            <View>
                <Text>
                    {"사용자 정보 수신에 실패했습니다."}
                </Text>
            </View>
        );
    }

    const fetchHomeProjects = async () => {
        try {
            const fetchedProjects = await fetchMyProjectCard();
            setProjects(fetchedProjects);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            setProjects([]);
        }
    };

    useEffect(() => {
        fetchHomeProjects();
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
            <ScrollView
                contentContainerStyle={[{
                        flexGrow: 1,
                        paddingVertical: 8,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 8
                    },
                ]}
            >
                {/* Comment / Remove the following ScrollView to see the PostCard views only */}
                {/* <ScrollView
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
                /> */}

                {
                    (projects.length === 0) &&
                    <Text>
                        {"프로젝트가 없습니다."}
                    </Text>
                }
                {
                    (projects.length > 0) &&
                    projects.map((project: api.ProjectCard, index: number) => {
                        console.log("project: ", project);
                        return (
                            <View
                                key={project.id}
                                style={styles.projectContainer}    
                            >
                                {/** project preview call */}
                                <ProjectPreview
                                    projectInfo={project}
                                    myId={myId}
                                />
                                {/** post preview call */}
                                {
                                    project.posts.length > 0 &&
                                    <View
                                        style={styles.postViewContainer}
                                    >
                                        {
                                            project.posts.map((post: any, index: number) => {
                                                return (
                                                    <PostInProjectPreview
                                                        key={post.id}
                                                        postInfo={post}
                                                        myId={myId}
                                                    />
                                                );
                                            })
                                        }
                                    </View>
                                }
                            </View>
                        );
                    })
                }
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    projectContainer : {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        backgroundColor: theme.colors.white,
        paddingVertical: 20
    },
    postViewContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.colors.white,
        gap: 15
    }
});
