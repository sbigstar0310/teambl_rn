import {StyleSheet, Text, View} from "react-native";
import Avatar from "@/components/common/Avatar";
import theme from "@/shared/styles/theme";

interface TaggedUserAvatarsProps {
    taggedUsers: api.User[];
}

export default function TaggedUserAvatars(props: TaggedUserAvatarsProps) {
    const user1 = props.taggedUsers[0];
    const user2 = props.taggedUsers[1];
    const remainingUsersNum = Math.max(0, props.taggedUsers.length - 2);

    return (
        <View style={styles.container}>
            {user1 && <View style={styles.item}>
                <Avatar
                    imageURL={user1.profile.image}
                    size={20}
                />
            </View>}
            {user2 && <View style={[styles.item, styles.itemOnTop]}>
                <Avatar
                    imageURL={user2.profile.image}
                    size={20}
                />
            </View>}
            {remainingUsersNum > 0 && <View style={[styles.remainingNumContainer, styles.itemOnTop]}>
                <Text style={styles.remainingNumText}>+{remainingUsersNum}</Text>
            </View>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row"
    },
    item: {
        borderWidth: 1,
        borderColor: theme.colors.white,
        borderRadius: 999,
    },
    itemOnTop: {
        marginLeft: -5
    },
    remainingNumContainer: {
        backgroundColor: theme.colors.achromatic01,
        paddingHorizontal: 4,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center"
    },
    remainingNumText: {
        color: theme.colors.white,
        fontSize: 12
    }
})