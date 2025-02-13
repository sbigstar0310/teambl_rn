import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import TaggedUserAvatars from "@/components/post/TaggedUserAvatars";
import theme from "@/shared/styles/theme";
import TickIcon from '@/assets/conversations/tick-icon.svg';
import {Fragment} from "react";

interface ProjectDetailsInPostProps {
    project: api.ProjectCard,
    post: api.Post,
    onSubscribe: () => void,
    isSubscribed: boolean
}

export default function ProjectDetailsInPost(props: ProjectDetailsInPostProps) {
    return (
        <View style={styles.container}>
            <View style={styles.detailsContainer}>
                {/* Project title */}
                <Text>{props.project.title}</Text>
                {/* Tagged user profiles */}
                <TaggedUserAvatars taggedUsers={props.post.tagged_users}/>
            </View>
            {/* Vertical line */}
            <View style={styles.verticalLine}/>
            {/* Subscribe button */}
            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={props.onSubscribe}
            >
                {props.isSubscribed
                    ? <Fragment>
                        <Text style={styles.buttonText}>구독됨</Text>
                        <TickIcon width={8} height={8}/>
                    </Fragment>
                    : <Text style={styles.buttonText}>+ 소식 받기</Text>
                }
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        paddingHorizontal: 20
    },
    detailsContainer: {
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    verticalLine: {
        width: 1,
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
        fontSize: 12,

    }
})