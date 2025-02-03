import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";
import FriendsCard from "@/components/friends/FriendsCard";

interface UserListProps {
    title: string;
    userList: any[];
}

export default function UserListScreen(props: UserListProps) {

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["top"]}
        >
            {/* 상단 헤더 */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <LeftArrowIcon/>
                </TouchableOpacity>
                <Text style={styles.title}>{props.title}</Text>
            </View>

            {/* 탭 내용 */}
            <View style={styles.contentContainer}>
                <Text style={styles.resultCount}>
                    {props.userList.length}명
                </Text>
                <ScrollView>
                    {props.userList.map((item, index) => (
                        <FriendsCard
                            key={index}
                            id={item.user.id}
                            relation_degree={item.relation_degree}
                            user={item.user}
                            status=""
                        />
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    resultCount: {
        fontSize: 14,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 17,
        color: "#595959",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    backButton: {
        marginRight: 20,
    },
    title: {
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: 20,
        lineHeight: 24,
        color: "#121212",
    },
});
