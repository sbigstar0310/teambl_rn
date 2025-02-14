import React from 'react';
import BottomModal from './BottomModal';
import { StyleSheet, Text, View } from 'react-native';
import CircularIconButton from './CircularIconButton';
import InlineIconButton from './InlineIconButton';
import theme from '@/shared/styles/theme';
import {router} from "expo-router";

interface ProjectBottomModalProps {
    isVisible: boolean;
    onClose: () => void;
    isMyProject: boolean;
    projectId: number;
    projectTitle: string;
}

const ProjectBottomModal = (props: ProjectBottomModalProps) => {
    const {
        isVisible,
        onClose,
        isMyProject,
        projectId,
        projectTitle
    } = props;

    const handleLinkCopy = () => {  
        // TODO : Copy project link
    }

    const handleEdit = () => {  
        // TODO : Edit project
    }

    const handleDelete = () => {
        // TODO : Delete project
    }

    const handleInviteLinkCopy = () => {
        // TODO : Copy invite link
    }

    const handleQRCodeShare = () => {
        // TODO : Share QR code
    }

    const handleNewPostInProject =  () => {
        props.onClose();
        router.push({
            pathname: `/project/${projectId}/new_post`,
            params: { project_title: projectTitle }
        })
    }
    

    const MyProject = () => {
        return (
            <View
                style={styles.myContainer}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{"프로젝트에 팀원 초대"}</Text>
                </View>
                <View
                    style={styles.otherContainer}
                >
                    <CircularIconButton
                        type="INVITELINK"
                        onPress={handleInviteLinkCopy}
                    />
                    <CircularIconButton
                        type="QRCODE"
                        onPress={handleQRCodeShare}
                    />
                </View>
                <View
                    style={styles.buttonContainer}
                >
                    <InlineIconButton
                        type="NEWPOST"
                        onPress={handleNewPostInProject}
                    />
                    <InlineIconButton
                        type="COPYLINK"
                        onPress={handleLinkCopy}
                    />
                    <InlineIconButton
                        type="EDITPROJECT"
                        onPress={handleEdit}
                    />
                    <InlineIconButton
                        type="DELETEPROJECT"
                        onPress={handleDelete}
                    />
                </View>
            </View>
        );
    };

    const OthersProject = () => {
        return (
            <View
                style={styles.otherContainer}
            >
                <CircularIconButton
                    type="COPYLINK"
                    onPress={handleLinkCopy}
                />
                <CircularIconButton
                    type="DELETE"
                    onPress={handleDelete}
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
            fixedHeight={isMyProject ? 430 : undefined}
        />
    );
};

const styles = StyleSheet.create({
    otherContainer : {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    myContainer : {
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 10
    },
    titleContainer : {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: 16
    },
    title : {
        fontSize: theme.fontSizes.body1,
        fontWeight: 600,
        color: theme.colors.black
    },
    buttonContainer : {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 20,
        padding: 0,
        borderTopWidth: 1,
        borderTopColor: theme.colors.achromatic04
    }
});

export default ProjectBottomModal;