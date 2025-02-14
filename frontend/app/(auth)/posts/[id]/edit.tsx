import {View} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import {useEffect, useMemo, useState} from "react";
import PostCreateForm, {defaultPostFormData, PostCreateFormData} from "@/components/forms/PostCreateForm";
import {sharedStyles} from "@/app/_layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import {PostButton} from "@/components/forms/ProjectCreateForm";
import Popup from "@/components/Popup";
import fetchPostById from "@/libs/apis/Post/fetchPostById";
import updatePost from "@/libs/apis/Post/updatePost";

export default function EditPost() {
    const {id, project_title = ""} = useLocalSearchParams();
    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
    const [data, setData] = useState<PostCreateFormData>(defaultPostFormData);
    const [isLoading, setIsLoading] = useState(false);
    const isValid = useMemo<boolean>(
        () => data.content.length !== 0,
        [data]
    );

    useEffect(() => {
        if (!id) return;
        // Fetch post data
        fetchPost();
    }, []);

    const fetchPost = async () => {
        try {
            const postData = await fetchPostById(parseInt(id as string));
            setData({
                content: postData.content,
                tagged_users: postData.tagged_users,
                images: []
            });
        } catch (error) {
            console.error('Failed to fetch post data', error);
        }
    }

    const handleSubmit = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            await updatePost(parseInt(id as string), {
                content: data.content,
                tagged_users: data.tagged_users.map((user) => user.id),
                images: data.images
            });

            // go Back
            setData(defaultPostFormData);
            router.back();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = router.back;

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader
                title="게시물 수정"
                onBack={setIsConfirmationPopupOpen.bind(null, true)}
                actionButton={() => (
                    <PostButton
                        disabled={!isValid || isLoading}
                        onPress={handleSubmit}
                        label={isLoading ? "수정 중..." : undefined}
                    />
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
                title="수정 취소"
                description="저장하지 않으면 내용이 삭제됩니다. 수정을 종료하시겠습니까?"
                confirmLabel="수정 종료"
                closeLabel="계속 수정"
            />
        </View>
    )
}