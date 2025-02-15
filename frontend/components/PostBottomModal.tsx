import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import BottomModal from "./BottomModal";
import CircularIconButton from "./CircularIconButton";
import deletePost from "@/libs/apis/Post/deletePost";
import createReport from "@/libs/apis/createReport";

const PostBottomModal = (props: any) => {
    const { visible, onClose, isMyPost, postId } = props;

    const handleLinkCopy = () => {
        // TODO : Copy project link
    };

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
        // TODO : 게시글 삭제 후 홈화면이 다시 그려져야 함.
        try {
            await deletePost(postId);
        } catch (error) {
            console.error("Failed to delete post with ID ${postId}:", error);
        }
    };

    const handleEdit = () => {
        // TODO : Edit project
    };

    const Body = () => {
        return (
            <View style={styles.container}>
                <CircularIconButton type="COPYLINK" onPress={handleLinkCopy} />
                {isMyPost && (
                    <CircularIconButton type="EDIT" onPress={handleEdit} />
                )}
                {isMyPost && (
                    <CircularIconButton type="DELETE" onPress={handleDelete} />
                )}
                {!isMyPost && (
                    <CircularIconButton type="REPORT" onPress={handleReport} />
                )}
            </View>
        );
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            body={<Body />}
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
