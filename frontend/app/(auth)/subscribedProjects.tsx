import styled from "@emotion/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";
import theme from "@/shared/styles/theme";
import PostInProjectPreview from "@/components/PostInProjectPreview";
import fetchLikedPosts from "../../libs/apis/Post/fetchLikedPosts";
import { mockPost1, mockPost2 } from "@/shared/mock-data";
import { useAuthStore } from "@/store/authStore";
import fetchMyProjectCard from "@/libs/apis/ProjectCard/fetchMyProjectCard";
import ProjectPreview from "@/components/ProjectPreview";
import fetchBookmarkedProjectCards from "@/libs/apis/ProjectCard/fetchBookmarkedProjectCards";

type Params = {
    target_user_id_string: string;
};

const LoadingContainer = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 10;
`;

const SubscribedProjects = () => {
    const myId = useAuthStore.getState().user?.id || -99;

    if (myId === -99) {
        return (
            <View>
                <Text>{"사용자 정보 수신에 실패했습니다."}</Text>
            </View>
        );
    }
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<api.ProjectCard[]>([]);

    const fetchSubscribedProjects = async () => {
        setLoading(true);
        try {
            const fetchedProjects = await fetchBookmarkedProjectCards();
            setProjects(fetchedProjects);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribedProjects();
    }, []);

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.white }}
            edges={["top"]}
        >
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <LeftArrowIcon />
                </TouchableOpacity>
                <Text style={styles.title}>{"소식 받기 한 프로젝트"}</Text>
            </View>
            <ScrollView
                contentContainerStyle={[
                    {
                        flexGrow: 1,
                        paddingVertical: 8,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 8,
                        backgroundColor: theme.colors.achromatic05,
                    },
                ]}
            >
                {projects.length === 0 && <Text>{"프로젝트가 없습니다."}</Text>}
                {projects.length > 0 &&
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
                                {project.posts.length > 0 && (
                                    <View style={styles.postViewContainer}>
                                        {project.posts.map(
                                            (post: any, index: number) => {
                                                return (
                                                    <PostInProjectPreview
                                                        key={post.id}
                                                        postInfo={post}
                                                        myId={myId}
                                                    />
                                                );
                                            }
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    backButton: {
        marginRight: 20,
    },
    title: {
        fontFamily: "PretendardSemiBold",
        fontStyle: "normal",
        fontSize: 20,
        lineHeight: 24,
        color: "#121212",
    },
    noPostContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
    },
    noPostText: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.achromatic01,
    },
    postContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        backgroundColor: theme.colors.white,
        padding: 20,
    },
    projectContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        backgroundColor: theme.colors.white,
        paddingVertical: 20,
    },
    postViewContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        paddingVertical: 0,
        backgroundColor: theme.colors.white,
        gap: 15,
    },
});

export default SubscribedProjects;
