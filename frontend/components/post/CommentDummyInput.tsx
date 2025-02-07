import {StyleSheet, TextInput, TouchableOpacity} from "react-native";
import theme from "@/shared/styles/theme";
import Avatar from "@/components/common/Avatar";
import {Fragment} from "react";

interface CommentDummyInputProps {
    user: api.User;
    onModalOpen: () => void;
}

export default function CommentDummyInput(props: CommentDummyInputProps) {
    return (
        <Fragment>
            <TouchableOpacity
                style={styles.container}
                onPress={props.onModalOpen}
            >
                <Avatar
                    imageURL={props.user.profile.image}
                    size={28}
                />
                <TextInput
                    style={styles.dummyInput}
                    placeholder="댓글 작성하기..."
                    editable={false}
                />
            </TouchableOpacity>
        </Fragment>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.achromatic05,
        paddingVertical: 10,
        paddingHorizontal: 20,
        gap: 10
    },
    dummyInput: {
        flexGrow: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 24,
        backgroundColor: theme.colors.white
    }
})