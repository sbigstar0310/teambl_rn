import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Modal,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import MyFriendsHeader from "@/components/friends/MyFriendsHeader";
import MyFriendsTabs from "@/components/friends/MyFriendsTabs";
import FriendsCard from "@/components/friends/FriendsCard";
import fetchFriendList from "@/libs/apis/Friend/fetchFriendList";
import { getCurrentUserId } from "@/shared/utils";
import getUserDistance from "@/libs/apis/getUserDistance";
import eventEmitter from "@/libs/utils/eventEmitter";

type FriendExtension = {
    id: number;
    relation_degree?: number;
    user: api.User;
    from_user: api.User;
    to_user: api.User;
    status: string;
};

export default function MyFriendsScreen() {
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<"나의 1촌" | "내게 신청한">(
        (params.activeTab as "나의 1촌" | "내게 신청한") || "나의 1촌"
    );
    const [loading, setLoading] = useState(false); // 로딩 상태 추가

    const [myOneChoneFriends, setMyOneChoneFriends] = useState<
        FriendExtension[]
    >([]); // 1촌 친구 목록 데이터 추가
    const [myRequestedFriends, setMyRequestedFriends] = useState<
        FriendExtension[]
    >([]); // 내게 신청한 친구 목록 데이터 추가

    // 친구 목록을 가져오는 함수
    const fetchFriends = async () => {
        try {
            // 로딩 시작
            setLoading(true);

            // 현재 사용자 ID 가져오기
            const current_user_id = await getCurrentUserId().then(Number);

            // 친구 목록을 가져오는 API 호출
            const response = await fetchFriendList(current_user_id);
            // console.log("Fetched friends:", response);

            // API 응답(api.Friend[]) 전처리 과정 (해당 user, relation_degree, status를 가져온다)
            const processedFriends: FriendExtension[] = await Promise.all(
                response.map(async (friend) => {
                    const friend_id = friend.id;

                    // from_user가 현재 유저라면 to_user를 선택, 아니면 from_user 선택
                    const user =
                        friend.from_user.id === current_user_id
                            ? friend.to_user
                            : friend.from_user;

                    // 유저 간 거리 계산
                    const relation_degree = await getUserDistance(user.id).then(
                        (res) => res.distance
                    );

                    return {
                        id: friend_id,
                        relation_degree,
                        user,
                        from_user: friend.from_user,
                        to_user: friend.to_user,
                        status: friend.status,
                    };
                })
            );

            // "나의 1촌" 친구 (status가 "accepted"이거나, "pending"이면서 내가 보낸 요청)
            const myOneChoneFriends = processedFriends
                .filter(
                    (friend) =>
                        friend.status === "accepted" ||
                        (friend.status === "pending" &&
                            friend.from_user.id === current_user_id)
                )
                .sort((a, b) =>
                    a.status === "pending" && b.status !== "pending" ? -1 : 1
                );
            // console.log(myOneChoneFriends[0].to_user);

            // "내게 신청한" 친구 (status가 "pending"이면서 상대가 보낸 요청)
            const myRequestedFriends = processedFriends.filter(
                (friend) =>
                    friend.status === "pending" &&
                    friend.to_user.id === current_user_id
            );

            setMyOneChoneFriends(myOneChoneFriends);
            setMyRequestedFriends(myRequestedFriends);
        } catch (error) {
            console.error("Failed to fetch friends:", error);
            // 에러 처리
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    useEffect(() => {
        fetchFriends();
        eventEmitter.on("handleFriend", fetchFriends);
        return () => {
            eventEmitter.off("handleFriend", fetchFriends);
        };
    }, []);

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
            <MyFriendsHeader />

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
                        <Text style={styles.resultCount}>
                            {myOneChoneFriends.length}명
                        </Text>
                        <ScrollView>
                            {myOneChoneFriends.map((friend, index) => (
                                <FriendsCard
                                    id={friend.id}
                                    key={index}
                                    relation_degree={friend.relation_degree}
                                    user={friend.user}
                                    status={
                                        friend.status === "pending"
                                            ? "requested"
                                            : friend.status
                                    }
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}
                {activeTab === "내게 신청한" && (
                    <View>
                        <Text style={styles.resultCount}>
                            {myRequestedFriends.length}명
                        </Text>
                        <ScrollView>
                            {myRequestedFriends.map((friend, index) => (
                                <FriendsCard
                                    id={friend.id}
                                    key={index}
                                    relation_degree={friend.relation_degree}
                                    user={friend.user}
                                    status={
                                        friend.status === "pending"
                                            ? "received"
                                            : friend.status
                                    }
                                />
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
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
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
