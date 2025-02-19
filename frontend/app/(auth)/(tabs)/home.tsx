import {RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {Fragment, useEffect, useState} from "react";
import Header from "@/components/Header";
import PostInProjectPreview from "@/components/PostInProjectPreview";
import {useAuthStore} from "@/store/authStore";
import theme from "@/shared/styles/theme";
import ProjectPreview from "@/components/ProjectPreview";
import searchProjectCard from "@/libs/apis/Search/searchProjectCard";

export default function HomeScreen() {
    const [projects, setProjects] = useState<api.ProjectCard[]>([]);

    const myId = useAuthStore.getState().user?.id || -99;

    useEffect(() => {
        fetchHomeProjects();
    }, []);

    const fetchHomeProjects = async () => {
        try {
            const searchedProjectCards = await searchProjectCard({q: ""});
            setProjects(searchedProjectCards.results);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            setProjects([]);
        }
    };

    if (myId === -99) {
        return (
            <View>
                <Text>
                    {"사용자 정보 수신에 실패했습니다."}
                </Text>
            </View>
        );
    }
    return (
        <>
            <Header/>
            <ScrollView
                contentContainerStyle={[{
                    paddingVertical: 8,
                    gap: 8
                },
                ]}
                refreshControl={<RefreshControl
                    refreshing={false}
                    onRefresh={fetchHomeProjects}
                />}
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
                    (projects.length > 0) &&
                    projects.map((project: api.ProjectCard, index: number) => {
                        return (
                            <View
                                key={index}
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
                                                        key={index}
                                                        postInfo={post}
                                                        myId={myId}
                                                        onPostDelete={fetchHomeProjects}
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
    projectContainer: {
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
        padding: 16,
        paddingVertical: 0,
        backgroundColor: theme.colors.white,
        gap: 15
    }
});
