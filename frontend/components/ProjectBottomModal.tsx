import React from 'react';
import BottomModal from './BottomModal';
import { StyleSheet, View } from 'react-native';
import CircularIconButton from './CircularIconButton';

const ProjectBottomModal = (props: any) => {

    const {
        isVisible,
        onClose,
        isMyProject,
        projectId
    } = props;

    const MyProject = () => {
        return (
            <View
                style={styles.myContainer}
            >
                {/** todo */}
            </View>
        );
    };

    const OthersProject = () => {
        return (
            <View
                style={styles.otherContainer}
            >
                <CircularIconButton
                    type="EDIT"
                    onPress={() => {}}
                />
                <CircularIconButton
                    type="DELETE"
                    onPress={() => {}}
                />
            </View>
        );
    };

    return (
        <BottomModal
            visible={isVisible}
            onClose={onClose}
            body={isMyProject ? <MyProject /> : <OthersProject />}
            heightPercentage={isMyProject ? 0.6 : 0.2}
        />
    );
};

const styles = StyleSheet.create({
    otherContainer : {
        flex: 1,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    myContainer : {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center"
    }
});

export default ProjectBottomModal;