import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Avatar from "@/components/common/Avatar";
import theme from "@/shared/styles/theme";
import {Fragment, useState} from "react";
import UserListScreen from "@/components/user/UserList";
import BottomModal from "@/components/BottomModal";
import {router} from "expo-router";

interface TaggedUserAvatarsProps {
    taggedUsers: api.User[];
}

export default function TaggedUserAvatars(props: TaggedUserAvatarsProps) {
    const user1 = props.taggedUsers[0];
    const user2 = props.taggedUsers[1];
    const remainingUsersNum = Math.max(0, props.taggedUsers.length - 2);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUserSelect = (userId: number) => {
        router.push(`/profiles/${userId}`);
        setIsModalOpen(false);
    }

    return (
        <Fragment>
            <TouchableOpacity
                style={styles.container}
                onPress={setIsModalOpen.bind(null, true)}
            >
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
            </TouchableOpacity>
            <BottomModal
                visible={isModalOpen}
                onClose={setIsModalOpen.bind(null, false)}
                body={
                    <UserListScreen
                        title="태그된 사용자"
                        userList={props.taggedUsers.map(user => ({user, relation_degree: 1}))}
                        hideBackButton={true}
                        onSelect={handleUserSelect}
                    />
                }
                heightPercentage={0.8}
            />
        </Fragment>
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