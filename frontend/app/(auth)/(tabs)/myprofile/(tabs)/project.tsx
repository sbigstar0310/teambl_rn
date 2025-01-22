import React from 'react';
import {Text, View} from 'react-native';
import PrimeButton from "@/components/PrimeButton";
import {router} from "expo-router";

const MyProfileProjectView = () => {
    return (
        <View>
            <Text>
                Project!
            </Text>
            <PrimeButton
                text="게시물 추가하기"
                onClickCallback={async () => router.push('/project/1/post')}
                isActive={true}
                isLoading={false}
            />
        </View>
    );
};

export default MyProfileProjectView;