import {View} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import {sharedStyles} from "@/app/_layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import {useMemo, useState} from "react";
import PostCreateForm, {defaultPostFormData, PostCreateFormData} from "@/components/forms/PostCreateForm";
import {PostButton} from "@/components/forms/ProjectCreateForm";
import Popup from "@/components/Popup";
import createPost from "@/libs/apis/Post/createPost";

export default function NewPostForProject() {
    const {id, project_title = ""} = useLocalSearchParams();
    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
    const [data, setData] = useState<PostCreateFormData>(defaultPostFormData);
    const isValid = useMemo<boolean>(
        () => data.content.length !== 0,
        [data]
    );

    const handlePost = async () => {
        try {
            const response = await createPost({
                content: data.content,
                tagged_users: data.tagged_users.map((user) => user.id),
                images: data.images.map((image) => image.blob),
            });

            // go Back
            setData(defaultPostFormData);
            router.back();

            console.log(response);
        } catch (error) {
            console.log(error);
        }
    };

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
            <PostCreateForm
                projectTitle={String(project_title)}
                data={data}
                setData={setData}
            />
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