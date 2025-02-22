import { ScrollView, View } from "react-native";
import { sharedStyles } from "@/app/_layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import { useMemo, useState } from "react";
import ProjectCreateForm, {
    defaultProjectFormData,
    PostButton,
    ProjectCreateFormData,
} from "@/components/forms/ProjectCreateForm";
import { router } from "expo-router";
import Popup from "@/components/Popup";
import createProjectCard from "@/libs/apis/ProjectCard/createProjectCard";
import { getCurrentUserId } from "@/shared/utils";
import dayjs from "dayjs";

export default function ProjectsScreen() {
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

    const handlePost = async () => {
        try {
            setIsLoading(true);
            // Get current user id (creator id)
            const current_user_id = await getCurrentUserId().then(
                (id_string) => {
                    const id_num = Number(id_string);
                    if (!id_num) {
                        throw new Error("current user id error");
                    }

                    return id_num;
                }
            );

            // Project Card Create API
            await createProjectCard({
                title: data.title,
                keywords: data.keywords,
                accepted_users: data.mentions.map((user) => user.id),
                creator: current_user_id,
                start_date: data.timePeriod?.start ? dayjs(data.timePeriod.start).format("YYYY-MM-DD") : null,
                end_date: data.timePeriod?.end ? dayjs(data.timePeriod.end).format("YYYY-MM-DD") : null,
                description: data.description ?? "",
            });

            // go Back
            setData(defaultProjectFormData);
            setIsLoading(false);
            router.push("/");
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
                title="프로젝트 작성"
                onBack={setIsConfirmationPopupOpen.bind(null, true)}
                actionButton={() => (
                    <PostButton
                        disabled={!isValid || isLoading}
                        onPress={handlePost}
                        label={isLoading ? "작성 중..." : undefined}
                    />
                )}
            />
            <ScrollView
                style={sharedStyles.horizontalPadding}
                showsVerticalScrollIndicator={false}
            >
                <ProjectCreateForm data={data} setData={setData} />
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
