import React, { useEffect, useState, useRef } from "react";
import { View, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
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
                                            key={index}
                                            postInfo={post}
                                            myId={myId}
                                            onPostDelete={fetchMyProjectCard}
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

    if (myId === -99) {
        return (
            <View>
                <Text>
                    Error in getting user id
                </Text>
            </View>
        );
    }

    if (projectCards.length === 0) {
            return (
                <View
                    style={styles.noProjContainer}
                >
                    <Text
                        style={styles.noProjText}
                    >
                        {"프로젝트가 없습니다."}
                    </Text>
                </View>
            );
    }
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
    noProjContainer : {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
    },
    noProjText: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.achromatic01
    },
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
