import React, { useState, } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Modal,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyFriendsHeader from "@/components/friends/MyFriendsHeader";
import MyFriendsTabs from "@/components/friends/MyFriendsTabs";
import FriendsCard from "@/components/friends/FriendsCard";

export default function MyFriendsScreen() {
    const [activeTab, setActiveTab] = useState<"나의 1촌" | "내게 신청한">(
        "나의 1촌"
    );
    const [loading, setLoading] = useState(false); // 로딩 상태 추가

    const mockFriendsData = [
        {
            relation_degree: 1,
            user: {
                profile: {
                    image: null,
                    user_name: "김철수",
                    school: "서울대학교",
                    current_academic_degree: "학사",
                    year: 2018,
                    major1: "컴퓨터공학",
                    major2: "전기전자공학",
                },
            },
            status: "connected",
        },
        {
            relation_degree: 2,
            user: {
                profile: {
                    image: null,
                    user_name: "이영희",
                    school: "연세대학교",
                    current_academic_degree: "석사",
                    year: 2016,
                    major1: "경영학",
                    major2: null,
                },
            },
            status: "requested",
        },
        {
            relation_degree: 3,
            user: {
                profile: {
                    image: null,
                    user_name: "박민수",
                    school: "고려대학교",
                    current_academic_degree: "박사",
                    year: 2014,
                    major1: "심리학",
                    major2: "사회학",
                },
            },
            status: "received",
        },
    ];

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["top"]}
        >
            {/* 로딩 모달 */}
            <Modal visible={loading} transparent>
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            </Modal>

            {/* 상단 헤더 */}
            <MyFriendsHeader/>

            {/* 탭 메뉴 */}
            <MyFriendsTabs
                tabs={["나의 1촌", "내게 신청한"]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* 탭 내용 */}
            <View style={styles.contentContainer}>
                {activeTab === "나의 1촌" && (
                    <View>
                        <Text style={styles.resultCount}>{mockFriendsData.length}명</Text>
                        <ScrollView>
                            {mockFriendsData.map((friend, index) => (
                                <FriendsCard key={index} relation_degree={friend.relation_degree} user={friend.user} status="requested"/>
                            ))}
                            {mockFriendsData.map((friend, index) => (
                                <FriendsCard key={index} relation_degree={friend.relation_degree} user={friend.user} status="accepted"/>
                            ))}
                        </ScrollView>
                    </View>
                )}
                {activeTab === "내게 신청한" && (
                    <View>
                        <Text style={styles.resultCount}>{mockFriendsData.length}명</Text>
                        <ScrollView>
                            {mockFriendsData.map((friend, index) => (
                                <FriendsCard key={index} relation_degree={friend.relation_degree} user={friend.user} status="received"/>
                            ))}
                        </ScrollView>
                    </View>
                )}
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
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
});
