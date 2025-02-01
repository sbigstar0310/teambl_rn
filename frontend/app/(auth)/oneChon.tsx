import { View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import styled from "@emotion/native";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import fetchOneDegreeFriends from "@/libs/apis/Friend/fetchOneDegreeFriends";
import { useLocalSearchParams } from "expo-router";
import getUserDistance from "@/libs/apis/getUserDistance";
import UserList from "@/components/user/UserList";

type Params = {
    target_user_id_string: string;
};

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
        <View style={{ flex: 1 }}>
            {/* 로딩 중 표시 */}
            {loading && (
                <LoadingContainer>
                    <ActivityIndicator size="large" color="#2546F3" />
                </LoadingContainer>
            )}

            <UserList
                title={`${user?.profile.user_name}님의 1촌`}
                userList={oneChonList}
            />
        </View>
    );
};

export default oneChon;
