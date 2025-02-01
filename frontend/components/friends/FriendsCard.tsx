import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { router } from "expo-router";
import DefaultProfile from "@/assets/DefaultProfile.svg";
import WaitingIcon from "@/assets/friends/WaitingIcon.svg";
import RefuseIcon from "@/assets/friends/RefuseIcon.svg";
import AcceptIcon from "@/assets/friends/AcceptIcon.svg";
import updateFriend from "@/libs/apis/Friend/updateFriend";

// 상태 타입 정의
type RelationStatus = "accepted" | "requested" | "received" | "rejected";

type FriendsCardData = {
    id: number;
    relation_degree?: number;
    user: api.User;
    status: RelationStatus | string;
};

export default function FriendsCard({
    id,
    relation_degree,
    user,
    status,
    fetchFriends,
}: FriendsCardData & { fetchFriends?: () => void }) {
    const profile = user.profile;

    const acceptFriendRequest = async () => {
        try {
            await updateFriend(id, { status: "accepted" });
            fetchFriends?.();
        } catch (error) {
            console.log("Failed to accept friend request:", error);
        }
    };

    const refuseFriendRequest = async () => {
        try {
            await updateFriend(id, { status: "rejected" });
            fetchFriends?.();
        } catch (error) {
            console.log("Failed to accept friend request:", error);
        }
    };

    return (
        <TouchableOpacity onPress={() => router.push(`/profiles/${user.id}`)}>
            <View style={[styles.cardContainer]}>
                {/* 이미지 */}
                <View style={styles.imageContainer}>
                    {profile.image ? (
                        <Image
                            source={{ uri: profile.image }}
                            style={styles.image}
                        />
                    ) : (
                        <DefaultProfile width={52} height={52} />
                    )}
                </View>
                {/* 텍스트 정보 */}
                <View style={styles.textContainer}>
                    <View
                        style={[styles.infoContainer, styles.nameAndRelation]}
                    >
                        <Text style={styles.userName}>{profile.user_name}</Text>
                        <Text style={styles.relation}>
                            {relation_degree
                                ? ` · ${relation_degree}촌`
                                : " · 4촌 이상"}
                        </Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                            {profile.school} | {profile.current_academic_degree}{" "}
                            | {profile.year % 100}학번
                        </Text>
                        <Text style={styles.infoText}>
                            {profile.major1}
                            {profile.major2 ? ` · ${profile.major2}` : ""}
                        </Text>
                    </View>
                </View>
                {/* 상태에 따른 아이콘 표시 */}
                {status === "requested" && <WaitingIcon />}
                {status === "received" && (
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity onPress={refuseFriendRequest}>
                            <RefuseIcon />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={acceptFriendRequest}>
                            <AcceptIcon />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: "row",
        paddingVertical: 16,
        alignItems: "center",
    },
    imageContainer: {
        marginRight: 10,
    },
    image: {
        width: 52,
        height: 52,
        borderRadius: 24,
    },
    textContainer: {
        flex: 1,
    },
    infoContainer: {
        marginBottom: 4,
    },
    nameAndRelation: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        fontSize: 16,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: 19,
        color: "#121212",
    },
    relation: {
        fontSize: 12,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 14,
        color: "#595959",
    },
    infoText: {
        fontSize: 14,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 17,
        color: "#121212",
    },
});
