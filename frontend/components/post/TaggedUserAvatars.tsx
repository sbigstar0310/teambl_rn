import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Avatar from "@/components/common/Avatar";
import theme from "@/shared/styles/theme";
import {Fragment, useEffect, useMemo, useState} from "react";
import UserListScreen from "@/components/user/UserList";
import BottomModal from "@/components/BottomModal";
import {router} from "expo-router";
import getUserDistance from "@/libs/apis/getUserDistance";

interface TaggedUserAvatarsProps {
    taggedUsers: api.User[];
}

type UserWithRelation = {
    user: api.User;
    relation_degree: number;
}

export default function TaggedUserAvatars(props: TaggedUserAvatarsProps) {
    const user1 = useMemo(() => props.taggedUsers[0], [props.taggedUsers]);
    const user2 = useMemo(() => props.taggedUsers[1], [props.taggedUsers]);
    const remainingUsersNum = useMemo(() => Math.max(0, props.taggedUsers.length - 2), [props.taggedUsers]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taggedUsersWithRelations, setTaggedUsersWithRelations] = useState<UserWithRelation[]>([]);

    useEffect(() => {
        setTaggedUsersWithRelations(props.taggedUsers.map(user => ({user, relation_degree: 1})));
        fetchRelations();
    }, [props.taggedUsers]);

    const fetchRelations = async () => {
        // Fetch relations between tagged users and the current user
        // and update the state
        try {
            const relationsData = await Promise.all(props.taggedUsers.map(async user => {
                try {
                    const distance = (await getUserDistance(user.id))?.distance || 4;
                    return {user, relation_degree: distance};
                } catch {
                    return {user, relation_degree: 4};
                }
            }));
            setTaggedUsersWithRelations(relationsData);
        } catch (error) {
            console.error("Failed to fetch relations:", error);
        }
    }

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
                        userList={taggedUsersWithRelations}
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