import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from "react-native";
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
import fetchProjInvitationsAPI from "@/libs/apis/ProjectCardInvitation/fetchMyProjectCardInvitations";
import eventEmitter from "@/libs/utils/eventEmitter";

const { width, height } = Dimensions.get("window");

const MyProfileProjectView = () => {
    const myId = useAuthStore.getState().user?.id || -99;

    const [projectCards, setProjectCards] = useState<api.ProjectCard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const carouselRef = useRef<ICarouselInstance>(null);
    
    const [isLoading, setIsLoading] = useState(false);

    const fetchMyProjectCard = async () => {
        try {
            setIsLoading(true);
            // Fetch both APIs in parallel
            const [fetchedProjectCards, fetchProjInvitations] =
                await Promise.all([
                    fetchMyProjectCardAPI(),
                    fetchProjInvitationsAPI(),
                ]);

            // Extract pending invitations with a valid project_card
            const pendingProjectCards: api.ProjectCard[] = fetchProjInvitations
                .filter(
                    (
                        invite
                    ): invite is api.ProjectCardInvitation & {
                        project_card: api.ProjectCard;
                    } =>
                        invite.status === "pending" &&
                        invite.project_card !== null
                )
                .map((invite) => ({
                    ...invite.project_card,
                    invite_id: invite.id // project_card의 invite_id를 id 값으로 설정
                }));

            // Ensure pendingProjectCards are placed before fetchedProjectCards
            setProjectCards([...pendingProjectCards, ...fetchedProjectCards]);
        } catch (error) {
            console.log("Error in fetching my project cards: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProjectCard();
        eventEmitter.on("handleProjInvitation", fetchMyProjectCard);
        return () => {
            eventEmitter.off("handleProjInvitation", fetchMyProjectCard);
        };
    }, []);

    const prevSlide = async () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            carouselRef.current?.scrollTo({
                index: currentIndex - 1,
                animated: true,
            });
        }
    };

    const nextSlide = async () => {
        if (currentIndex < projectCards.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            carouselRef.current?.scrollTo({
                index: currentIndex + 1,
                animated: true,
            });
        }
    };

    const scrollY = useScroll() || new Animated.Value(0);

    const renderItem = ({ item }: { item: api.ProjectCard }) => {
        return (
            <ScrollView
                key={item.id}
                contentContainerStyle={{
                    ...styles.cardScrollContainer,
                    paddingVertical: 10,
                }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps={"handled"}
            >
                {/** loader */}
                {isLoading && (
                    <Modal visible={true} transparent>
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    </Modal>
                )}
                <View style={styles.cardContainer}>
                    {/** badge for the pagination */}
                    <View style={styles.indexPaginationContainer}>
                        <View style={styles.indexPagination}>
                            <TouchableOpacity
                                onPress={prevSlide}
                                style={{ paddingRight: 10 }}
                            >
                                {currentIndex <= 0 ? (
                                    <LeftSmallArrowDisabled />
                                ) : (
                                    <LeftSmallArrow />
                                )}
                            </TouchableOpacity>
                            {/** text */}
                            <Text style={styles.indexText}>
                                {currentIndex + 1} ・ {projectCards.length}
                            </Text>
                            <TouchableOpacity
                                onPress={nextSlide}
                                style={{ paddingLeft: 10 }}
                            >
                                {currentIndex >= projectCards.length - 1 ? (
                                    <RightSmallArrowDisabled />
                                ) : (
                                    <RightSmallArrow />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/** project preview call */}
                    <ProjectPreview projectInfo={item} myId={myId} />
                    {/** post preview call */}
                    {item.posts.length > 0 && (
                        <View style={styles.postViewContainer}>
                            {item.posts.map((post: any, index: number) => {
                                return (
                                    <PostInProjectPreview
                                        key={index}
                                        postInfo={post}
                                        myId={myId}
                                        onPostDelete={fetchMyProjectCard}
                                    />
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        );
    };

    if (myId === -99) {
        return (
            <View>
                <Text>Error in getting user id</Text>
            </View>
        );
    }

    if (projectCards.length === 0) {
        return (
            <View style={styles.noProjContainer}>
                <Text style={styles.noProjText}>{"프로젝트가 없습니다."}</Text>
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
    noProjContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
    },
    noProjText: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.achromatic01,
    },
    carouselContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 10,
    },
    cardScrollContainer: {
        flexGrow: 1,
        alignItems: "center",
    },
    cardContainer: {
        width: "100%",
        backgroundColor: theme.colors.white,
        paddingVertical: 12,
        alignItems: "center",
    },
    indexPaginationContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
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
        marginBottom: 16,
    },
    indexText: {
        fontSize: theme.fontSizes.caption,
        fontWeight: 400,
        color: theme.colors.achromatic01,
    },
    postViewContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: theme.colors.white,
        gap: 15,
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0)",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default MyProfileProjectView;
