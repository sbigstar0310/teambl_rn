import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import DefaultProfile from "@/assets/DefaultProfile.svg";

type UserCardProps = {
    user: {
        profile: {
            user_name: string;
            relation_degree: string;
            school: string;
            current_academic_degree: string;
            year: number;
            major1: string;
            major2: string | null;
            image: string | null;
            keywords: string[];
        };
    };
};

export default function UserCard(user: api.UserSearchResult) {
    const profile = user.profile;

    return (
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
                <View style={[styles.infoContainer, styles.nameAndRelation]}>
                    <Text style={styles.userName}>{profile.user_name}</Text>
                    <Text style={styles.relation}>
                        {user.relation_degree
                            ? ` · ${user.relation_degree}촌`
                            : " · 4촌 이상"}
                    </Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        {profile.school} | {profile.current_academic_degree} |{" "}
                        {profile.year % 100}학번
                    </Text>
                    <Text style={styles.infoText}>
                        {profile.major1}
                        {profile.major2 ? ` · ${profile.major2}` : ""}
                    </Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.keywords}>
                        {profile.keywords.join(" / ")}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: "row",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
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
    keywords: {
        fontSize: 14,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 17,
        color: "#595959",
    },
});
