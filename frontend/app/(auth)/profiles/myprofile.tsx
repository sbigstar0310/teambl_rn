import { sharedStyles } from '@/app/_layout';
import React from 'react';
import { View, Text } from 'react-native';

const MyProfilePage = () => {

    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding]}>
            <Text>{"my profile page"}</Text>
        </View>
    );
};

export default MyProfilePage;