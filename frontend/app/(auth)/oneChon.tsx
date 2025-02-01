import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React, { FC, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "@emotion/native";
import ScreenHeader from "@/components/common/ScreenHeader";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import fetchOneDegreeFriends from "@/libs/apis/Friend/fetchOneDegreeFriends";
import { mockUser1, mockUser2, mockUser3 } from "@/shared/mock-data";
import { useLocalSearchParams } from "expo-router";
import FriendsCard from "@/components/friends/FriendsCard";
import getUserDistance from "@/libs/apis/getUserDistance";

type Params = {
    target_user_id_string: string;
};

const Container = styled(SafeAreaView)`
    flex: 1;
    background-color: #fff;
    padding-horizontal: 20px;
    border-width: 1px;
`;

const LoadingContainer = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 10;
`;

const TotalFriendsCountText = styled.Text`
    color: #595959;
    font-family: Pretendard;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
`;

type UserExtension = {
    user: api.User;
    relation_degree?: number;
};

// 상대방의 일촌 리스트를 보여주는 화면
// 사용법:
// router.push({
//     pathname: "/oneChon",
//     params: {
//         target_user_id_string: <string>,
//     },
// })
const oneChon = () => {
    const { target_user_id_string } = useLocalSearchParams<Params>();
    const target_user_id = Number(target_user_id_string);
    const [user, setUser] = useState<api.User | null>(null);
    const [oneChonList, setOneChonList] = useState<UserExtension[]>([]);
    const [loading, setLoading] = useState(true);

    // 유저 정보 가져오기
    const fetchUser = async () => {
        try {
            const userInfo = await getUserInfo(target_user_id);
            setUser(userInfo);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    // 일촌 리스트 가져오기
    const fetchOneChonList = async () => {
        try {
            // Backend API call to fetch friends list
            const friends = await fetchOneDegreeFriends(target_user_id);

            // Fetch relation degrees asynchronously using Promise.all
            const oneChonList = await Promise.all(
                friends.map(async (friend) => {
                    const distanceData = await getUserDistance(friend.id);
                    return {
                        user: friend,
                        relation_degree: distanceData.distance,
                    };
                })
            );

            setOneChonList(oneChonList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching one chon list:", error);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchOneChonList();
    }, []);

    return (
        <Container>
            <ScreenHeader
                title={`${user?.profile.user_name}님의 1촌`}
                style={{ paddingHorizontal: 0 }}
            />

            {/* 로딩 중 표시 */}
            {loading && (
                <LoadingContainer>
                    <ActivityIndicator size="large" color="#2546F3" />
                </LoadingContainer>
            )}

            <TotalFriendsCountText>
                {oneChonList.length.toString()}명
            </TotalFriendsCountText>

            <FlatList
                data={oneChonList}
                keyExtractor={(item) => item.user.id.toString()}
                renderItem={({ item, index }) => (
                    <FriendsCard
                        id={item.user.id}
                        key={index}
                        relation_degree={item.relation_degree}
                        user={item.user}
                        status={""}
                    />
                )}
            />
        </Container>
    );
};

export default oneChon;
