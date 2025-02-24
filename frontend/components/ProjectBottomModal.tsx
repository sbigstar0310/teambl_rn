import React from "react";
import BottomModal from "./BottomModal";
import { Alert, StyleSheet, Text, View } from "react-native";
import CircularIconButton from "./CircularIconButton";
import InlineIconButton from "./InlineIconButton";
import theme from "@/shared/styles/theme";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";

import createProjectLink from "@/libs/apis/ProjectCard/createProjectLink";
import leaveProjectCard from "@/libs/apis/ProjectCard/leaveProjectCard";
import createProjectCardInvitationLink from "@/libs/apis/ProjectCardInvitationLink/createProjectCardInvitationLink";
import createReport from "@/libs/apis/Report/createReport";

interface ProjectBottomModalProps {
    isVisible: boolean;
    onClose: () => void;
    isMyProject: boolean; // 프로젝트의 Creator인지 여부
    isJoined: boolean; // 프로젝트의 참여자인지 여부 (accepted_users에 포함되어 있는지 여부)
    projectId: number;
    projectTitle: string;
}

const ProjectBottomModal = (props: ProjectBottomModalProps) => {
    const {
        isVisible,
        onClose,
        isMyProject,
        isJoined,
        projectId,
        projectTitle,
    } = props;

    const handleLinkCopy = async () => {
        try {
            const response = await createProjectLink({
                project_card_id: projectId,
            });
            const projectLink = response.unique_id;

            // projectLink는 프로젝트의 고유한 코드. 이를 이용해서 전체 링크를 만들어야 함.

            await Clipboard.setStringAsync(projectLink);
            alert("프로젝트 링크가 클립보드에 복사되었습니다!");
        } catch (error) {
            console.error("프로젝트 링크 복사 실패:", error);
            alert("링크를 복사하는 동안 오류가 발생했습니다.");
        }
    };

    const handleEdit = async () => {
        if (!isMyProject) {
            alert("이 프로젝트를 수정할 권한이 없습니다.");
            return;
        }

        router.push(`project/${projectId}/edit`);
    };

    const handleLeave = async () => {
        try {
            await leaveProjectCard(projectId);
        } catch (error) {
            console.error("프로젝트 탈퇴 실패:", error);
            alert("프로젝트 탈퇴 중 오류가 발생했습니다.");
        } finally {
            props.onClose(); // 모달 닫기
        }
    };

    const handleReport = async () => {
        try {
            await createReport({
                content: "신고합니다.",
                related_project_card_id: projectId,
            });
            Alert.alert("신고가 접수되었습니다.");
        } catch (error) {
            console.error("Failed to report post with ID ${postId}:", error);
        }
    };

    const handleInviteLinkCopy = async () => {
        try {
            const inviteLink = await createProjectCardInvitationLink(projectId);
            if (!inviteLink?.link)
                throw new Error("Server did not return invitation link");
            await Clipboard.setStringAsync(inviteLink.link);
            alert("프로젝트 초대 링크가 클립보드에 복사되었습니다!");
        } catch (error) {
            console.error("프로젝트 초대 링크 생성 실패:", error);
            alert("프로젝트 초대 링크 생성 중 오류가 발생했습니다.");
        } finally {
            props.onClose();
        }
    };

    const handleQRCodeShare = () => {
        // TODO : Share QR code
    };

    const handleNewPostInProject = () => {
        props.onClose();
        router.push({
            pathname: `/project/${projectId}/new_post`,
            params: { project_title: projectTitle },
        });
    };

    // 나의 프로젝트 경우
    const MyProject = () => {
        return (
            <View style={styles.myContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{"프로젝트에 팀원 초대"}</Text>
                </View>
                <View style={styles.otherContainer}>
                    <CircularIconButton
                        type="INVITELINK"
                        onPress={handleInviteLinkCopy}
                    />
                    <CircularIconButton
                        type="QRCODE"
                        onPress={handleQRCodeShare}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <InlineIconButton
                        type="NEWPOST"
                        onPress={handleNewPostInProject}
                    />
                    <InlineIconButton
                        type="COPYLINK"
                        onPress={handleLinkCopy}
                    />
                    <InlineIconButton type="EDITPROJECT" onPress={handleEdit} />
                    <InlineIconButton
                        type="LEAVEPROJECT"
                        onPress={handleLeave}
                    />
                </View>
            </View>
        );
    };

    // 프로젝트의 일반회원의 경우
    const NormalProject = () => {
        return (
            <View style={styles.otherContainer}>
                <CircularIconButton type="COPYLINK" onPress={handleLinkCopy} />
                <CircularIconButton type="LEAVE" onPress={handleLeave} />
                <CircularIconButton type="REPORT" onPress={handleReport} />
            </View>
        );
    };

    // 프로젝트 참여 회원 아닌 경우
    const OthersProject = () => {
        return (
            <View style={styles.otherContainer}>
                <CircularIconButton type="COPYLINK" onPress={handleLinkCopy} />
                <CircularIconButton type="REPORT" onPress={handleReport} />
            </View>
        );
    };

    return (
        <BottomModal
            visible={isVisible}
            onClose={onClose}
            body={
                isMyProject ? (
                    <MyProject />
                ) : isJoined ? (
                    <NormalProject />
                ) : (
                    <OthersProject />
                )
            }
            heightPercentage={isMyProject ? 0.6 : 0.2}
            fixedHeight={isMyProject ? 430 : undefined}
        />
    );
};

const styles = StyleSheet.create({
    otherContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    myContainer: {
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 10,
    },
    titleContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: theme.fontSizes.body1,
        fontWeight: 600,
        color: theme.colors.black,
    },
    buttonContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 20,
        padding: 0,
        borderTopWidth: 1,
        borderTopColor: theme.colors.achromatic04,
    },
});

export default ProjectBottomModal;
