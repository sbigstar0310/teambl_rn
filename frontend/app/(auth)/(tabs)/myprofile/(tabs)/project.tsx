import React, { useEffect, useState } from "react";
import { View } from "react-native";
import PrimeButton from "@/components/PrimeButton";
import { router } from "expo-router";
import fetchMyProjectCardAPI from "@/libs/apis/ProjectCard/fetchMyProjectCard";

const MyProfileProjectView = () => {
    // TODO: use this fetched ProjectCards! (Frontend)
    const [projectCards, setProjectCards] = useState<api.ProjectCard[]>([]);

    const fetchMyProjectCard = async () => {
        try {
            const fetchedProjectCards = await fetchMyProjectCardAPI();
            console.log(
                "MyProfileProjectView: fetchedProjectCards",
                fetchedProjectCards
            );
            setProjectCards(fetchedProjectCards);
        } catch (error) {
            console.log("Error in fetching my project cards: ", error);
        }
    };

    useEffect(() => {
        fetchMyProjectCard();
    }, []);

    const goToNewPostForProject = (projectId: number, projectTitle: string) => {
        router.push(`/project/${projectId}/post?project_title=${projectTitle}`);
    };

    return (
        <View>
            {projectCards.map((projectCard, index) => (
                <PrimeButton
                    text={`게시물 추가하기 for ${projectCard.title}`}
                    onClickCallback={async () =>
                        goToNewPostForProject(projectCard.id, projectCard.title)
                    }
                    isActive={true}
                    isLoading={false}
                    key={index}
                />
            ))}
        </View>
    );
};

export default MyProfileProjectView;
