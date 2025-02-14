import React from 'react';
import { StyleSheet, View } from 'react-native';
import BottomModal from './BottomModal';
import CircularIconButton from './CircularIconButton';

const PostBottomModal = (props: any) => {

    const {
        visible,
        onClose,
        isMyPost,
        postId
    } = props;

    const handleLinkCopy = () => {  
        // TODO : Copy project link
    }

    const handleReport = () => {  
        // TODO : Report
    }

    const handleDelete = () => {
        // TODO : Delete project
    }

    const handleEdit = () => {
        // TODO : Edit project
    }

    const Body = () => {
        return (
            <View
                style={styles.container}
            >
                <CircularIconButton
                    type="COPYLINK"
                    onPress={handleLinkCopy}
                />
                {
                    isMyPost &&
                    <CircularIconButton
                        type="EDIT"
                        onPress={handleEdit}
                    />
                }
                {
                    isMyPost &&
                    <CircularIconButton
                        type="DELETE"
                        onPress={handleDelete}
                    />
                }
                {
                    (!isMyPost) &&
                    <CircularIconButton
                        type="REPORT"
                        onPress={handleReport}
                    />
                }
            </View>
        );
    }

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
    container : {
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    }
});

export default PostBottomModal;