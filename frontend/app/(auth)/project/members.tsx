import styled from '@emotion/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";
import theme from '@/shared/styles/theme';
import UserListScreen from '@/components/user/UserList';

type Params = {
    memberInfoList: string;
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

const members = () => {

    const params = useLocalSearchParams<Params>();
    const memberInfoList = params?.memberInfoList ? JSON.parse(params.memberInfoList) : null;

    if (memberInfoList === null) {
        return (
            <View>
                <Text>Invalid Access</Text>
            </View>
        );
    }

    if (memberInfoList.length <= 0) {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: "#fff" }}
                edges={["top"]}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <LeftArrowIcon />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {"프로젝트를 함께하는 사람들"}
                    </Text>
                </View>
                {
                    (memberInfoList.length === 0) && (
                        <View style={styles.noMemberContainer}>
                            <Text style={styles.noMemberText}>
                                {"이 프로젝트를 함께하는 사람이 없습니다."}
                            </Text>
                        </View>
                    )
                }
            </SafeAreaView>
        );
    } else {
        return (
            <UserListScreen
                userList={memberInfoList}
                title='프로젝트를 함께하는 사람들'
            />
        );
    }

};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    backButton: {
        marginRight: 20,
    },
    title: {
        fontFamily: "PretendardSemiBold",
        fontStyle: "normal",
        fontSize: 20,
        lineHeight: 24,
        color: "#121212",
    },
    noMemberContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
    },
    noMemberText: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.achromatic01,
    },
});

export default members;