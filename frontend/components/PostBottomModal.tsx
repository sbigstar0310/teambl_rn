import React from 'react';
import { StyleSheet, View } from 'react-native';
import BottomModal from './BottomModal';
import CircularIconButton from './CircularIconButton';

const PostBottomModal = (props: any) => {

    const {
        isVisible,
        onClose,
        isMyProject,
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

    const Body = () => {
        return (
            <View
                style={styles.container}
            >
                <CircularIconButton
                    type="COPYLINK"
                    onPress={handleLinkCopy}
                />
            </View>
        );
    }

    return (
        <BottomModal
            visible={isVisible}
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
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 10
    }
});

export default PostBottomModal;