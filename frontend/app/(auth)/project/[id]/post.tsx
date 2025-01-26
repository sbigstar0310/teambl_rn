import {View} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import {sharedStyles} from "@/app/_layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import {useEffect, useMemo, useState} from "react";
import PostCreateForm, {defaultPostFormData, PostCreateFormData} from "@/components/forms/PostCreateForm";
import {PostButton} from "@/components/forms/ProjectCreateForm";
import Popup from "@/components/Popup";
import {mockProject1} from "@/shared/mock-data";

export default function NewPostForProject() {
    const {id} = useLocalSearchParams();
    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
    const [project, setProject] = useState<api.ProjectCard | null>(null);
    const [data, setData] = useState<PostCreateFormData>(defaultPostFormData);
    const isValid = useMemo<boolean>(
        () => data.content.length !== 0,
        [data]
    );

    useEffect(() => {
        // TODO: load project information from API
        setProject(mockProject1);
    }, []);

    const handlePost = () => {
        console.log(data);
        // TODO: make api request to create post linked with project id
    }

    const handleBack = router.back;

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader
                title="게시물 작성"
                onBack={setIsConfirmationPopupOpen.bind(null, true)}
                actionButton={() => (
                    <PostButton disabled={!isValid} onPress={handlePost}/>
                )}
            />
            {project &&
                <PostCreateForm
                    project={project}
                    data={data}
                    setData={setData}
                />
            }
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
    )
}