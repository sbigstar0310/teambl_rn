import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import DefaultProfile from "@/assets/DefaultProfile.svg";

type UserSearchData = {
    is_new_user?: boolean;
    relation_degree: number | null;
    user: api.User;
};

export default function UserCard(data: UserSearchData) {
    const profile = data.user.profile;

    return (
        <TouchableOpacity
            onPress={() => router.push(`/profiles/${data.user.id}`)}
        >
            <View style={styles.cardContainer}>
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
                            {data.relation_degree
                                ? ` · ${data.relation_degree}촌`
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
                    {/* <View style={styles.infoContainer}>
                        <Text style={styles.keywords}>
                            {profile.keywords.join(" / ")}
                        </Text>
                    </View> */}
                </View>
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
    // keywords: {
    //     fontSize: 14,
    //     fontFamily: "Pretendard",
    //     fontStyle: "normal",
    //     fontWeight: "400",
    //     lineHeight: 17,
    //     color: "#595959",
    // },
});
