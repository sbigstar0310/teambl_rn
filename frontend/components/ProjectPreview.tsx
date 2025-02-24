import theme from "@/shared/styles/theme";
import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ThreeDotsVertical from "@/assets/ThreeDotsVertical.svg";
import VerticalBar from "@/assets/VerticalBar.svg";
import AddPostIcon from "@/assets/AddPostIcon.svg";
import ProfileImagePreviewer from "./ProfileImagePreviewer";
import ProjectBottomModal from "./ProjectBottomModal";
import dayjs from "dayjs";
import { router } from "expo-router";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import toggleBookmarkProjectCard from "@/libs/apis/ProjectCard/toggleBookmarkProjectCard";
import getUserDistance from "@/libs/apis/getUserDistance";
import projectCardInvitationResponse from "@/libs/apis/ProjectCardInvitation/projectCardInvitationResponse";
import SmallButton from "./buttons/SmallButton";
import eventEmitter from "@/libs/utils/eventEmitter";

interface KeywordBadgeProps {
    keyword: string;
}

const KeywordBadge = (props: KeywordBadgeProps) => {
    const { keyword } = props;

    return (
        <View style={styles.keywordBadge}>
            <Text style={styles.keywordText}>{keyword}</Text>
        </View>
    );
};

interface AddPostButtonProps {
    onPress: () => void;
}

export const AddPostButton = (props: AddPostButtonProps) => {
    const { onPress } = props;
    return (
        <TouchableOpacity style={styles.addPostButton} onPress={onPress}>
            <AddPostIcon />
            <Text style={styles.addPostText}>게시물 작성</Text>
        </TouchableOpacity>
    );
};

interface SubscribeButtonProps {
    onPress: () => void;
}

const SubscribeButton = (props: SubscribeButtonProps) => {
    const { onPress } = props;
    return (
        <TouchableOpacity style={styles.subscribeButton} onPress={onPress}>
            <Text style={styles.subscribeText}>+ 소식 받기</Text>
        </TouchableOpacity>
    );
};

interface ProjectPreviewProps {
    projectInfo: api.ProjectCard;
    myId: number;
    isHome?: Boolean;
}

const ProjectPreview = (props: ProjectPreviewProps) => {
    const {projectInfo, myId, isHome} = props;

    const [isLoading, setIsLoading] = useState(true);
    const [isOptionVisible, setIsOptionVisible] = useState(false);
    const [memberList, setMemberList] = useState<any[]>([]);

    useEffect(() => {
        fetchMemberProfile();
    }, [projectInfo.accepted_users]);

    const formatDateToYearMonth = (date: Date) => {
        return dayjs(date).format("YYYY.MM");
    };

    const handleSubscribe = async () => {
        try {
            await toggleBookmarkProjectCard({ projectCardId: projectInfo.id });
        } catch (error) {
            console.error("Failed to subscribe project:", error);
        }
    };

    const extractImages = () => {
        let images: any[] = [];
        memberList.map((user: any) => {
            images.push(user?.user.profile?.image);
        });
        return images;
    };

    const handleAddPost = () => {
        router.push({
            pathname: `/project/${projectInfo.id}/new_post`,
            params: { project_title: projectInfo.title },
        });
    };

    const handleMemberView = () => {
        if (isLoading) {
            return;
        }
        router.push({
            pathname: `/project/members`,
            params: {
                memberInfoList: JSON.stringify(memberList),
            },
        });
    };

    const fetchMemberProfile = async () => {
        setIsLoading(true);
        setMemberList([]);
        const userIds = projectInfo.accepted_users ?? [];

        try {
            // Fetch user information
            const accepted_users = await Promise.all(
                userIds.map((userId) => getUserInfo(userId))
            );

            // Fetch relation degrees
            const memberProfiles = await Promise.all(
                accepted_users.map(async (user) => {
                    try {
                        const relation_degree = await getUserDistance(user.id);
                        return {
                            user: { ...user },
                            relation_degree: relation_degree.distance, // Use the actual fetched relation degree
                        };
                    } catch {
                        return {
                            user: { ...user },
                            relation_degree: 4, // Show relation_degree as 4 in case api request fails
                        };
                    }
                })
            );

            console.log("memberProfiles", memberProfiles);
            setMemberList(memberProfiles);
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const projInvitationResponse = async (status: "accepted" | "rejected") => {
        try {
            setIsLoading(true);
            if (projectInfo.invite_id !== undefined) {
                await projectCardInvitationResponse(projectInfo.invite_id, {status});
                await eventEmitter.emit("handleProjInvitation");
            } else {
                console.error("invite_id is undefined");
            }
        } catch (error) {
            console.error("Failed to Response Invitation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {projectInfo.invite_id &&
                <View style={styles.buttonContainer}>
                    <SmallButton
                        text={"초대 수락"}
                        onClickCallback={() =>
                            projInvitationResponse("accepted")
                        }
                        isLoading={isLoading}
                    />
                    <SmallButton
                        text={"초대 거절"}
                        onClickCallback={() =>
                            projInvitationResponse("rejected")
                        }
                        isLoading={isLoading}
                        type={"secondary"}
                    />
                </View>
            }
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{projectInfo.title}</Text>
                <TouchableOpacity
                    style={{ paddingLeft: 10 }}
                    onPress={() => setIsOptionVisible(true)}
                >
                    <ThreeDotsVertical />
                </TouchableOpacity>
            </View>
            {projectInfo.keywords.length > 0 && (
                <View style={styles.keywordContainer}>
                    {projectInfo.keywords.map(
                        (keyword: string, index: number) => {
                            return (
                                <KeywordBadge key={index} keyword={keyword} />
                            );
                        }
                    )}
                </View>
            )}
            <View style={styles.descriptionContainer}>
                <Text
                    style={styles.descriptionText}
                    numberOfLines={isHome ? 3 : undefined}
                    ellipsizeMode={isHome ? "tail" : undefined}
                >
                    {projectInfo.description}
                </Text>
            </View>
            <View style={styles.bottomTabContainer}>
                {projectInfo.start_date && ( // start_date can also be null
                    <Fragment>
                        <Text style={styles.dateText}>
                            {`${formatDateToYearMonth(
                                projectInfo.start_date
                            )} ~`}
                        </Text>
                        {projectInfo.end_date && (
                            <Text style={styles.dateText}>
                                {` ${formatDateToYearMonth(
                                    projectInfo.end_date
                                )}`}
                            </Text>
                        )}
                        <VerticalBar
                            style={{ marginLeft: 16, marginRight: 16 }}
                        />
                    </Fragment>
                )}
                <ProfileImagePreviewer
                    imageUrlList={extractImages()}
                    onClick={handleMemberView}
                />
                {projectInfo.creator.id === myId && (
                    <AddPostButton onPress={handleAddPost} />
                )}
                {/** 아래 true는 현재 로그인한 사용자가 해당 프로젝트를 구독했는지 여부의 negate로 수정 : TODO */}
                {projectInfo.creator.id !== myId && (
                    <SubscribeButton onPress={() => handleSubscribe()} />
                )}
            </View>
            {/** bottom sheet */}
            <ProjectBottomModal
                isVisible={isOptionVisible}
                onClose={() => setIsOptionVisible(false)}
                isMyProject={`${projectInfo.creator.id}` === `${myId}`}
                isJoined={projectInfo.accepted_users.includes(myId)}
                projectId={projectInfo.id}
                projectTitle={projectInfo.title}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        gap: 20,
    },
    titleContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: theme.fontSizes.body1,
        fontWeight: 600,
        color: theme.colors.black,
    },
    keywordContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        flexWrap: "wrap",
        marginTop: 12,
        gap: 8,
    },
    keywordBadge: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background2,
        borderRadius: 10,
        paddingHorizontal: 6,
        height: 17,
    },
    keywordText: {
        color: theme.colors.point,
        fontSize: theme.fontSizes.caption,
        fontWeight: 600,
    },
    descriptionContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        flexWrap: "wrap",
        marginTop: 20,
    },
    descriptionText: {
        fontSize: theme.fontSizes.body1,
        fontWeight: 400,
        color: theme.colors.black,
    },
    bottomTabContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 20,
    },
    dateText: {
        fontSize: theme.fontSizes.caption,
        fontWeight: 400,
        color: theme.colors.achromatic01,
    },
    addPostButton: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.white,
        borderRadius: 5,
        paddingHorizontal: 8,
        height: 28,
        marginLeft: "auto",
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.achromatic03,
    },
    subscribeButton: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.achromatic05,
        borderRadius: 5,
        paddingHorizontal: 8,
        height: 28,
        marginLeft: "auto",
        gap: 8,
    },
    addPostText: {
        color: theme.colors.achromatic01,
        fontSize: theme.fontSizes.caption,
        fontWeight: 600,
    },
    subscribeText: {
        color: theme.colors.black,
        fontSize: theme.fontSizes.caption,
        fontWeight: 600,
    },
});

export default ProjectPreview;
