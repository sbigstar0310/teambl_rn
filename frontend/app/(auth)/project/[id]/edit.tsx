import {ScrollView, View} from "react-native";
import {useEffect, useMemo, useState} from "react";
import ProjectCreateForm, {
    defaultProjectFormData,
    PostButton,
    ProjectCreateFormData
} from "@/components/forms/ProjectCreateForm";
import {router, useLocalSearchParams} from "expo-router";
import {sharedStyles} from "@/app/_layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import Popup from "@/components/Popup";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import updateProjectCard from "@/libs/apis/ProjectCard/updateProjectCard";
import retrieveProjectCard from "@/libs/apis/ProjectCard/retrieveProjectCard";
import dayjs from "dayjs";
import deleteProjectCardInvitation from "@/libs/apis/ProjectCardInvitation/deleteProjectCardInvitation";
import createProjectCardInvitation from "@/libs/apis/ProjectCardInvitation/createProjectCardInvitation";

export default function EditProject() {
    const {id} = useLocalSearchParams();
    const [projectData, setProjectData] = useState<api.ProjectCard>();
    const [data, setData] = useState<ProjectCreateFormData>(
        defaultProjectFormData
    );
    const [isLoading, setIsLoading] = useState(false);
    const isValid = useMemo<boolean>(
        () => !!data.title && data.keywords.length >= 2,
        [data]
    );
    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] =
        useState(false);

    useEffect(() => {
        if (!id) return;
        // Load project data from backend
        fetchProjectData(Number(id));
    }, []);

    useEffect(() => {
        if (!projectData) return
        const mentionedUsers = [
            ...(projectData.accepted_users ?? []),
            ...(projectData.pending_invited_users ?? [])
        ]
        fetchMentionedUsers(mentionedUsers).then(mentions => {
            const defaultFormData: ProjectCreateFormData = {
                title: projectData.title,
                keywords: projectData.keywords,
                mentions,
                description: projectData.description
            };
            if (projectData.start_date) {
                defaultFormData.timePeriod = {
                    start: new Date(projectData.start_date),
                    end: projectData.end_date ? new Date(projectData.end_date) : undefined
                }
            }
            setData(defaultFormData);
        });
    }, [projectData]);

    const fetchProjectData = async (projectId: number) => {
        try {
            const apiData = await retrieveProjectCard(projectId);
            if (!apiData) {
                router.back();
                alert("이 프로젝트를 수정할 권한이 없습니다.");
                return;
            }
            setProjectData(apiData);
        } catch (error) {
            console.error("Failed to fetch project data:", error);
            router.back();
        }
    }

    const fetchMentionedUsers = async (userIds: number[]) => {
        try {
            return await Promise.all(userIds.map(id => getUserInfo(id)));
        } catch (error) {
            console.error("Failed to fetch mentioned users:", error);
            return [];
        }
    }

    const handleSubmit = async () => {
        if (!projectData) return;
        try {
            setIsLoading(true);
            // 업데이트할 데이터 (수정할 부분만 전달 가능)
            const {
                addedUsers,
                removedPendingUsers,
                removedAcceptedUsers
            } = getTaggedUserDifference(
                projectData.accepted_users,
                projectData.pending_invited_users ?? [],
                data.mentions
            );
            // Filter out removed users which previously accepted invitations
            const accepted_users = projectData.accepted_users
                .filter(id => !removedAcceptedUsers.includes(id));
            await updateProjectCard(projectData.id, {
                title: data.title,
                description: data.description,
                keywords: data.keywords,
                start_date: data.timePeriod?.start ? dayjs(data.timePeriod.start).format("YYYY-MM-DD") : null,
                end_date: data.timePeriod?.end ? dayjs(data.timePeriod.end).format("YYYY-MM-DD") : null,
                accepted_users
            });
            // Send invitations to added users
            addedUsers.forEach(async userId => {
                try {
                    await createProjectCardInvitation({
                        project_card: projectData.id,
                        invitee: userId
                    });
                } catch (error) {
                    console.error("Failed to send project card invitation:", error);
                }
            })
            // Cancel/Delete invitations to removed pending users
            removedPendingUsers.forEach(async userId => {
                try {
                    deleteProjectCardInvitation(projectData.id, userId);
                } catch (error) {
                    console.error("Failed to delete project card invitation:", error);
                }
            })
            alert("프로젝트가 성공적으로 수정되었습니다!");
            // go Back
            setData(defaultProjectFormData);
            setIsLoading(false);
            router.back();
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    };

    const getTaggedUserDifference = (
        originalAcceptedUsers: number[],
        originalPendingInvitedUsers: number[],
        newMentions: api.User[]
    ) => {
        const acceptedUsersSet = new Set(originalAcceptedUsers);
        const pendingInvitedUsersSet = new Set(originalPendingInvitedUsers);
        const originalUsersSet = new Set([...acceptedUsersSet, ...pendingInvitedUsersSet]);
        const newUsersSet = new Set(newMentions.map(user => user.id));
        // need to send invitations to addedUsers
        const addedUsers = new Set([...newUsersSet].filter(id => !originalUsersSet.has(id)));
        const removedUsers = new Set([...originalUsersSet].filter(id => !newUsersSet.has(id)));
        // need to delete invitations to removedPendingUsers
        const removedPendingUsers = new Set([...removedUsers].filter(id => pendingInvitedUsersSet.has(id)));
        // need to remove differences from acceptedUsers
        const removedAcceptedUsers = new Set([...removedUsers].filter(id => acceptedUsersSet.has(id)));
        return {
            addedUsers: Array.from(addedUsers),
            removedPendingUsers: Array.from(removedPendingUsers),
            removedAcceptedUsers: Array.from(removedAcceptedUsers)
        }
    }

    const handleBack = () => {
        setIsConfirmationPopupOpen(false);
        setData(defaultProjectFormData);
        router.back();
    };

    return (
        <View style={[sharedStyles.container]}>
            <ScreenHeader
                title="프로젝트 수정"
                onBack={setIsConfirmationPopupOpen.bind(null, true)}
                actionButton={() => (
                    <PostButton
                        disabled={!isValid || isLoading}
                        onPress={handleSubmit}
                        label={isLoading ? "수정 중..." : undefined}
                    />
                )}
            />
            <ScrollView
                style={sharedStyles.horizontalPadding}
                showsVerticalScrollIndicator={false}
            >
                <ProjectCreateForm data={data} setData={setData}/>
            </ScrollView>
            <Popup
                isVisible={isConfirmationPopupOpen}
                onClose={setIsConfirmationPopupOpen.bind(null, false)}
                onConfirm={handleBack}
                title="작성 취소"
                description="저장하지 않으면 내용이 삭제됩니다. 작성을 종료하시겠습니까?"
                confirmLabel="작성 종료"
                closeLabel="계속 작성"
            />
        </View>
    );
}