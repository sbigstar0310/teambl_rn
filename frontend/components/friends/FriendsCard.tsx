import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Modal,
} from "react-native";
import { router } from "expo-router";
import DefaultProfile from "@/assets/DefaultProfile.svg";
import WaitingIcon from "@/assets/friends/WaitingIcon.svg";
import RefuseIcon from "@/assets/friends/RefuseIcon.svg";
import AcceptIcon from "@/assets/friends/AcceptIcon.svg";
import updateFriend from "@/libs/apis/Friend/updateFriend";
import eventEmitter from "@/libs/utils/eventEmitter";

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
}: FriendsCardData) {
    const profile = user.profile;
    const [isLoading, setIsLoading] = useState(false);

    const handleFriendRequest = async (status: "accepted" | "rejected") => {
        try {
            setIsLoading(true); // 로딩 시작
            await updateFriend(id, { status });
            await eventEmitter.emit("handleFriend");
        } catch (error) {
            console.log(`Failed to ${status} friend request:`, error);
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    return (
        <TouchableOpacity 
            onPress={() => router.push(`/profiles/${user.id}`)}
            disabled={isLoading}
        >
            <View style={[styles.cardContainer]}>
                {/* 로딩 */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#2546F3" />
                    </View>
                )}
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
                        <TouchableOpacity 
                            onPress={() => handleFriendRequest("rejected")}
                            disabled={isLoading}
                        >
                            <RefuseIcon />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => handleFriendRequest("accepted")}
                            disabled={isLoading}
                        >
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
        borderRadius: 25,
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
        fontFamily: "PretendardSemiBold",
        fontStyle: "normal",
        lineHeight: 19,
        color: "#121212",
    },
    relation: {
        fontSize: 12,
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        lineHeight: 14,
        color: "#595959",
    },
    infoText: {
        fontSize: 14,
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        lineHeight: 17,
        color: "#121212",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject, // 부모 View 전체 덮기
        justifyContent: "center",
        alignItems: "center",
    },
});
