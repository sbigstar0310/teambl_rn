import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import PrimeButton from "@/components/PrimeButton";
import { router } from "expo-router";
import fetchMyProjectCardAPI from "@/libs/apis/ProjectCard/fetchMyProjectCard";

const MyProfileProjectView = () => {
    // TODO: use this fetched ProjectCards! (Frontend)
    const [projectCards, setProjectCards] = useState<api.ProjectCard[]>([]);

    const fetchMyProjectCard = async () => {
        try {
            const fetchedProjectCards = await fetchMyProjectCardAPI();
            console.log(fetchedProjectCards);
            setProjectCards(fetchedProjectCards);
        } catch (error) {
            console.log("Error in fetching my project cards: ", error);
        }
    };

    useEffect(() => {
        fetchMyProjectCard();
    }, []);

    return (
        <View>
            <Text>Project!</Text>
            <PrimeButton
                text="게시물 추가하기"
                onClickCallback={async () => router.push("/project/1/post")}
                isActive={true}
                isLoading={false}
            />
        </View>
    );
};

export default MyProfileProjectView;
