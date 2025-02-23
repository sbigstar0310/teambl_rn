import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import TaggedUserAvatars from "@/components/post/TaggedUserAvatars";
import theme from "@/shared/styles/theme";
import TickIcon from '@/assets/conversations/tick-icon.svg';
import {Fragment, useMemo} from "react";
import {AddPostButton} from "@/components/ProjectPreview";
import {router} from "expo-router";

interface ProjectDetailsInPostProps {
    project: api.ProjectCard,
    post: api.Post,
    taggedUsers: api.User[],
    onSubscribe: () => void,
    isSubscribed: boolean,
    isOnHeader?: boolean,
    myId: number
}

export default function ProjectDetailsInPost(props: ProjectDetailsInPostProps) {
    const doIBelongToProject = useMemo(
        () => props.project.accepted_users.includes(props.myId),
        [props.project.accepted_users, props.myId]
    );

    const handleAddPost = () => {
        router.push({
            pathname: `/project/${props.project.id}/new_post`,
            params: {project_title: props.project.title},
        });
    }

    return (
        <View style={[styles.container, {paddingHorizontal: props.isOnHeader === true ? 0 : 16}]}>
            {/* Vertical line */}
            {props.isOnHeader !== true && <View style={styles.verticalLine}/>}
            <View style={styles.detailsContainer}>
                {/* Project title */}
                <Text>{props.project.title}</Text>
                {/* Tagged user profiles */}
                {props.isOnHeader !== true &&
                    <TaggedUserAvatars taggedUsers={props.taggedUsers}/>
                }
            </View>
            {doIBelongToProject
                ? (
                    <AddPostButton
                        onPress={handleAddPost}
                    />
                )
                : (
                    <SubscribeButton
                        isSubscribed={props.isSubscribed}
                        onSubscribe={props.onSubscribe}
                    />
                )
            }
        </View>
    )
}

interface SubscribeButtonProps {
    isSubscribed: boolean,
    onSubscribe: () => void
}

const SubscribeButton = (props: SubscribeButtonProps) => {
    return (
        <TouchableOpacity
            style={styles.buttonContainer}
            onPress={props.onSubscribe}
        >
            {props.isSubscribed
                ? <Fragment>
                    <TickIcon width={8} height={8}/>
                    <Text style={styles.buttonText}>소식 받는 중</Text>
                </Fragment>
                : <Text style={styles.buttonText}>+ 소식 받기</Text>
            }
        </TouchableOpacity>);
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10
    },
    detailsContainer: {
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    verticalLine: {
        width: 2,
        height: "100%",
        backgroundColor: theme.colors.achromatic04
    },
    buttonContainer: {
        backgroundColor: "#F5F7FA",
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 4
    },
    buttonText: {
        color: theme.colors.black,
        fontWeight: 600,
        fontSize: 12
    }
})