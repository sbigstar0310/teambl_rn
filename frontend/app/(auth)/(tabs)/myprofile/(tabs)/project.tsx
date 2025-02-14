import React, { useEffect, useState, useRef } from "react";
import { View, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import PrimeButton from "@/components/PrimeButton";
import { router } from "expo-router";
import fetchMyProjectCardAPI from "@/libs/apis/ProjectCard/fetchMyProjectCard";
import { useScroll } from "@/components/provider/ScrollContext";
import theme from "@/shared/styles/theme";
import LeftSmallArrow from "@/assets/LeftSmallArrow.svg";
import RightSmallArrow from "@/assets/RightSmallArrow.svg";
import LeftSmallArrowDisabled from "@/assets/LeftSmallArrowDisabled.svg";
import RightSmallArrowDisabled from "@/assets/RightSmallArrowDisabled.svg";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import ProjectPreview from "@/components/ProjectPreview";
import { useAuthStore } from "@/store/authStore";
import PostInProjectPreview from "@/components/PostInProjectPreview";

const { width, height } = Dimensions.get("window");

const MyProfileProjectView = () => {

    const myId = useAuthStore.getState().user?.id || -99;

    if (myId === -99) {
        return (
            <View>
                <Text>
                    Error in getting user id
                </Text>
            </View>
        );
    }

    const [projectCards, setProjectCards] = useState<api.ProjectCard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const carouselRef = useRef<ICarouselInstance>(null);

    const fetchMyProjectCard = async () => {
        try {
            const fetchedProjectCards = await fetchMyProjectCardAPI();
            setProjectCards(fetchedProjectCards);
        } catch (error) {
            console.log("Error in fetching my project cards: ", error);
        }
    };

    useEffect(() => {
        fetchMyProjectCard();
    }, []);

    // const goToNewPostForProject = (projectId, projectTitle) => {
    //     router.push(`/project/${projectId}/post?project_title=${projectTitle}`);
    // };

    const prevSlide = async () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            carouselRef.current?.scrollTo({ index: currentIndex - 1, animated: true });
        }
    };

    const nextSlide = async () => {
        if (currentIndex < projectCards.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            carouselRef.current?.scrollTo({ index: currentIndex + 1, animated: true });
        }
    };

    const scrollY = useScroll() || new Animated.Value(0);

    const renderItem = ({ item }: { item: api.ProjectCard }) => {
        item['posts'] = [
            {
                "id": item.id + 1,
                "user": 1,
                "project_card": item.id,
                "content": "현재 등록된 게시글이 없어 임시 데이터를 제공합니다.",
                "created_at": new Date("2025-02-09T16:14:08.500206+09:00"),
                "like_count": 0,
                "tagged_users": [],
                "liked_users": [],
                "images": [],
                comments: []
            },
            {
                "id": item.id + 2,
                "user": 1,
                "project_card": item.id,
                "content": "등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요. 등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요. 등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요.",
                "created_at": new Date("2025-02-09T16:14:08.500206+09:00"),
                "like_count": 0,
                "tagged_users": [],
                "liked_users": [],
                "images": [
                    "https://image.newdaily.co.kr/site/data/img/2024/12/06/2024120600173_0.jpg",
                    "https://image.news1.kr/system/photos/2024/12/25/7054289/high.jpg",
                    "https://img.segye.com/content/image/2024/06/20/20240620502126.jpg"
                ],
                comments: []
            },
            {
                "id": item.id + 4,
                "user": 1,
                "project_card": item.id,
                "content": "현재 등록된 게시글이 없어 임시 데이터를 제공합니다.",
                "created_at": new Date("2025-02-09T16:14:08.500206+09:00"),
                "like_count": 10,
                "tagged_users": [],
                "liked_users": [],
                "images": [],
                comments: []
            },
            {
                "id": item.id + 3,
                "user": 1,
                "project_card": item.id,
                "content": "등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요. 등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요. 등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요.",
                "created_at": new Date("2025-02-09T16:14:08.500206+09:00"),
                "like_count": 99,
                "tagged_users": [],
                "liked_users": [],
                "images": [
                    "https://image.newdaily.co.kr/site/data/img/2024/12/06/2024120600173_0.jpg",
                    "https://image.news1.kr/system/photos/2024/12/25/7054289/high.jpg"
                ],
                comments: []
            },
            {
                "id": item.id + 35,
                "user": 1,
                "project_card": item.id,
                "content": "등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요. 등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요. 등록된 게시글이 없어 임시 데이터를 제공합니다.\n긴 텍스트가 포함된 경우를 테스트하기 위한 샘플입니다.\n안녕하세요.",
                "created_at": new Date("2025-02-09T16:14:08.500206+09:00"),
                "like_count": 3,
                "tagged_users": [],
                "liked_users": [],
                "images": [
                    "https://image.news1.kr/system/photos/2024/12/25/7054289/high.jpg"
                ],
                comments: []
            }
        ];
        return (
            <ScrollView
                key={item.id}
                contentContainerStyle={{ ...styles.cardScrollContainer, paddingVertical: 10 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps={"handled"}
            >
                <View style={styles.cardContainer}>
                    {/** badge for the pagination */}
                    <View
                        style={styles.indexPaginationContainer}
                    >
                        <View
                            style={styles.indexPagination}
                        >
                            <TouchableOpacity
                                onPress={prevSlide}
                                style={{ paddingRight: 10 }}
                            >
                                {
                                    (currentIndex <= 0) ?
                                        <LeftSmallArrowDisabled />
                                        :
                                        <LeftSmallArrow />
                                }
                            </TouchableOpacity>
                            {/** text */}
                            <Text style={styles.indexText}>
                                {currentIndex + 1} ・ {projectCards.length}
                            </Text>
                            <TouchableOpacity
                                onPress={nextSlide}
                                style={{ paddingLeft: 10 }}
                            >
                                {
                                    (currentIndex >= projectCards.length - 1) ?
                                        <RightSmallArrowDisabled />
                                        :
                                        <RightSmallArrow />
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/** project preview call */}
                    <ProjectPreview
                        projectInfo={item}
                        myId={myId}
                    />
                    {/** post preview call */}
                    {
                        item.posts.length > 0 &&
                        <View
                            style={styles.postViewContainer}
                        >
                            {
                                item.posts.map((post: any, index: number) => {
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
            </ScrollView>
        )
    };

    return (
        <View style={styles.carouselContainer}>
            <Carousel
                ref={carouselRef}
                data={projectCards}
                renderItem={renderItem}
                width={width}
                height={height - 370}
                loop={false}
                onSnapToItem={(index) => setCurrentIndex(index)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    carouselContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 10,
    },
    cardScrollContainer: {
        flexGrow: 1,
        alignItems: "center"
    },
    cardContainer: {
        width: '100%',
        backgroundColor: theme.colors.white,
        paddingVertical: 12,
        alignItems: "center",
    },
    indexPaginationContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    indexPagination: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 17,
        paddingHorizontal: 6,
        borderRadius: 24,
        backgroundColor: theme.colors.achromatic05,
        marginBottom: 16
    },
    indexText: {
        fontSize: theme.fontSizes.caption,
        fontWeight: 400,
        color: theme.colors.achromatic01,
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

export default MyProfileProjectView;
