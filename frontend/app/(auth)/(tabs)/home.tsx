import {Button, FlatList, ScrollView, View, Text} from "react-native";
import React, {useEffect, useState} from "react";
import {sharedStyles} from "@/app/_layout";
import Header from "@/components/Header";
import PostCard from "@/components/cards/PostCard";
import {mockPost1, mockPost2} from "@/shared/mock-data";
import {router} from "expo-router";

const mockPosts = [mockPost1, mockPost2];

export default function HomeScreen() {
    const [posts, setPosts] = useState<api.Post[]>([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = () => {
    //     TODO: fetch posts from api
        setPosts(mockPosts);
    }

    return (
        <>
            <Header/>
            <View
                style={[
                    sharedStyles.container,
                    {
                        borderTopWidth: 4,
                        borderColor: "#F5F5F5",
                        backgroundColor: '#FAFAFA',
                        padding: 16,
                    }
                ]}>
                {/* Comment / Remove the following ScrollView to see the PostCard views only */}
                <ScrollView
                    style={{
                        width: "100%",
                    }}
                >
                    <Text>Home Screen</Text>
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
                    <Button title="Go to Search" onPress={() => router.push("/search")} />
                    <Button
                        title="Go to Messages Inbox"
                        onPress={() => router.push("/conversations")}
                    />
                    <Button
                        title="Go to Login"
                        onPress={() => router.push("/onboarding")}
                    />
                    <Button
                        title="Go to Signup"
                        onPress={() => router.push("/signupOnboarding")}
                    />
                </ScrollView>

                <FlatList
                    contentContainerStyle={{
                        gap: 20,
                        padding: 2
                    }}
                    data={posts}
                    renderItem={({item, index}) => (
                        <PostCard
                            key={index}
                            post={item}
                        />
                    )}
                />
            </View>
        </>
    );
}
