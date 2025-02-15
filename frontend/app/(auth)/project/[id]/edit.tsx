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
import fetchMyProjectCard from "@/libs/apis/ProjectCard/fetchMyProjectCard";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import updateProjectCard from "@/libs/apis/ProjectCard/updateProjectCard";

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
        fetchMentionedUsers(projectData.accepted_users).then(mentions => {
            const defaultFormData: ProjectCreateFormData = {
                title: projectData.title,
                keywords: projectData.keywords,
                mentions,
                description: projectData.description
            };
            if (projectData.start_date) {
                data.timePeriod = {
                    start: new Date(projectData.start_date),
                    end: projectData.end_date ? new Date(projectData.end_date) : undefined
                }
            }
            setData(defaultFormData);
        });
    }, [projectData]);

    const fetchProjectData = async (projectId: number) => {
        try {
            const myProjects = await fetchMyProjectCard();
            const apiData = myProjects.find(p => p.id === projectId);
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
            await updateProjectCard(projectData.id, {
                title: data.title,
                description: data.description,
                keywords: data.keywords,
                start_date: data.timePeriod?.start ?? undefined,
                end_date: data.timePeriod?.end ?? undefined,
                accepted_users: data.mentions.map((user) => user.id)
            });

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