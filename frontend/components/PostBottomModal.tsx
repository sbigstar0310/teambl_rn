import React from "react";
import {Alert, StyleSheet, View} from "react-native";
import BottomModal from "./BottomModal";
import CircularIconButton from "./CircularIconButton";
import deletePost from "@/libs/apis/Post/deletePost";
import createReport from "@/libs/apis/createReport";
import * as Clipboard from "expo-clipboard";
import {createLinkToPost} from "@/shared/utils";
import {router} from "expo-router";
import retrieveProjectCard from "@/libs/apis/ProjectCard/retrieveProjectCard";

interface PostBottomModalProps {
    visible: boolean;
    onClose: () => void;
    isMyPost: boolean;
    postId: number;
    projectId: number;
    onDelete?: () => void;
}

const PostBottomModal = (props: PostBottomModalProps) => {
    const {visible, onClose, isMyPost, postId, projectId, onDelete} = props;

    const handleLinkCopy = async () => {
        try {
            await Clipboard.setStringAsync(
                createLinkToPost(props.postId)
            );
            onClose();
            alert("게시물 링크가 클립보드에 복사되었습니다!");
        } catch (error) {
            alert("링크를 복사하는 동안 오류가 발생했습니다.");
        }
    }

    const handleReport = async () => {
        try {
            await createReport({
                content: "신고합니다.",
                related_post_id: postId,
            });
            Alert.alert("신고가 접수되었습니다.");
        } catch (error) {
            console.error("Failed to report post with ID ${postId}:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePost(postId);
            onDelete?.();
        } catch (error) {
            console.error("Failed to delete post with ID ${postId}:", error);
        }
    };

    const handleEdit = async () => {
        try {
            const result = await retrieveProjectCard(projectId);
            router.push({
                pathname: `/posts/${postId}/edit`,
                params: {
                    project_title: result.title
                }
            });
            onClose();
        } catch (error) {
            console.error("Failed to edit post with ID ${postId}:", error);
        }
    };

    const Body = () => {
        return (
            <View style={styles.container}>
                <CircularIconButton type="COPYLINK" onPress={handleLinkCopy}/>
                {isMyPost && (
                    <CircularIconButton type="EDIT" onPress={handleEdit}/>
                )}
                {isMyPost && (
                    <CircularIconButton type="DELETE" onPress={handleDelete}/>
                )}
                {!isMyPost && (
                    <CircularIconButton type="REPORT" onPress={handleReport}/>
                )}
            </View>
        );
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            body={<Body/>}
            heightPercentage={0.2}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
});

export default PostBottomModal;
