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

const mockPosts = [mockPost1, mockPost2];

const likedPosts = () => {
    const { target_user_id_string } = useLocalSearchParams<Params>();
    const target_user_id = Number(target_user_id_string);

    const [loading, setLoading] = useState(true);
    const [postList, setPostList] = useState<api.Post[]>([]);

    const fetchLikedPostsList = async () => {
        try {
            const posts = await fetchLikedPosts();
            setPostList(posts);
        } catch (error) {
            console.error("Failed to fetch liked posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedPostsList();
    }, []);

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["top"]}
        >
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <LeftArrowIcon />
                </TouchableOpacity>
                <Text style={styles.title}>{"좋아요 한 게시물"}</Text>
            </View>
            {postList.length === 0 && (
                <View style={styles.noPostContainer}>
                    <Text style={styles.noPostText}>
                        {"내가 좋아요한 게시물이 없습니다."}
                    </Text>
                </View>
            )}
            {postList.length > 0 && (
                <ScrollView contentContainerStyle={styles.postContainer}>
                    {postList.map((post, index) => (
                        <PostInProjectPreview
                            key={index}
                            postInfo={post}
                            myId={target_user_id}
                        />
                    ))}
                </ScrollView>
            )}
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
});

export default likedPosts;
