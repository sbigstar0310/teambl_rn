import {
    View,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import {useEffect, useMemo, useState} from "react";
import PostCreateForm, {defaultPostFormData, PostCreateFormData, PostImage} from "@/components/forms/PostCreateForm";
import {sharedStyles} from "@/app/_layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import {PostButton} from "@/components/forms/ProjectCreateForm";
import Popup from "@/components/Popup";
import fetchPostById from "@/libs/apis/Post/fetchPostById";
import updatePost from "@/libs/apis/Post/updatePost";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import {convertApiImageToUIImage} from "@/shared/utils";

export default function EditPost() {
    const {id, project_title = ""} = useLocalSearchParams();
    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
    const [postData, setPostData] = useState<api.Post>();
    const [taggedUsers, setTaggedUsers] = useState<api.User[]>([]);
    const [images, setImages] = useState<PostImage[]>([]);
    const [data, setData] = useState<PostCreateFormData>(defaultPostFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchLoading, setIsFetchLoading] = useState(false);
    const isValid = useMemo<boolean>(
        () => data.content.length !== 0,
        [data]
    );

    useEffect(() => {
        if (!id) return;
        // Fetch post data
        fetchPost();
    }, []);

    useEffect(() => {
        if (!postData) return;
        fetchTaggedUsers((postData.tagged_users as any) as number[]);
        loadImages(postData.images);
    }, [postData]);

    useEffect(() => {
        if (!postData) return;
        setData({
            content: postData.content,
            tagged_users: taggedUsers,
            images: images
        });
    }, [postData, taggedUsers, images]);

    const fetchPost = async () => {
        try {
            setIsFetchLoading(true);
            const postData = await fetchPostById(parseInt(id as string));
            setPostData(postData);
        } catch (error) {
            console.error('Failed to fetch post data', error);
        } finally {
            setIsFetchLoading(false);
        }
    }
    const fetchTaggedUsers = async (userIds: number[]) => {
        try {
            setIsFetchLoading(true);
            const users = await Promise.all(
                userIds.map(id => getUserInfo(id)));
            setTaggedUsers(users);
        } catch (error) {
            console.error("Failed to fetch tagged users:", error);
        } finally {
            setIsFetchLoading(false);
        }
    }
    const loadImages = async (apiImages: api.PostImage[]) => {
        try {
            setIsFetchLoading(true);
            const images = await Promise.all(
                apiImages.map(convertApiImageToUIImage)
            );
            setImages(images.filter((image) => !!image));
        } catch (error) {
            console.error("Failed to load images", error);
        } finally {
            setIsFetchLoading(false);
        }
    }

    const handleSubmit = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            await updatePost(parseInt(id as string), {
                content: data.content,
                tagged_users: data.tagged_users.filter(item => !!item).map((user) => user.id),
                images: data.images
            });

            // go Back
            setData(defaultPostFormData);
            router.replace(`/posts/${id}`);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = router.back;

    return (
        <View style={sharedStyles.container}>
            {/* 로딩 모달 */}
            <Modal visible={isFetchLoading} transparent>
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            </Modal>

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

const styles = StyleSheet.create({
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
});