import React from "react";
import {Image, StyleSheet, Text, TouchableWithoutFeedback, View} from "react-native";
import DefaultProfile from "@/assets/DefaultProfile.svg";
import theme from "@/shared/styles/theme";

type UserSearchData = {
    is_new_user: boolean;
    relation_degree: number | null;
    user: api.User;
    is_selected?: boolean;
    isKeywordsHidden?: boolean;
};

export default function TagUserCard(data: UserSearchData) {
    const profile = data.user.profile;

    return (
        <View style={[styles.cardContainer, data.is_selected === true && styles.selectedCard]}>
            {/* 이미지 */}
            <View style={styles.imageContainer}>
                {profile.image ? (
                    <Image
                        source={{uri: profile.image}}
                        style={styles.image}
                    />
                ) : (
                    <DefaultProfile width={52} height={52}/>
                )}
            </View>
            {/* 텍스트 정보 */}
            <View style={styles.textContainer}>
                <View style={[styles.infoContainer, styles.nameAndRelation]}>
                    <TouchableWithoutFeedback>
                        <Text style={styles.userName}>{profile.user_name}</Text>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback>
                        <Text style={styles.relation}>
                            {data.relation_degree
                                ? ` · ${data.relation_degree}촌`
                                : " · 4촌 이상"}
                        </Text>
                    </TouchableWithoutFeedback>
                </View>
                <View style={styles.infoContainer}>
                    <TouchableWithoutFeedback>
                        <Text style={styles.infoText}>
                            {profile.school} | {profile.current_academic_degree} |{" "}
                            {profile.year % 100}학번
                        </Text>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback>
                        <Text style={styles.infoText}>
                            {profile.major1}
                            {profile.major2 ? ` · ${profile.major2}` : ""}
                        </Text>
                    </TouchableWithoutFeedback>
                </View>
                {data.isKeywordsHidden === true && (
                    <View style={styles.infoContainer}>
                        <TouchableWithoutFeedback>
                            <Text style={styles.keywords}>
                                {profile.keywords.join(" / ")}
                            </Text>
                        </TouchableWithoutFeedback>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: "row",
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    selectedCard: {
        backgroundColor: theme.colors.achromatic05,
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
