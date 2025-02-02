import { useScroll } from '@/components/provider/ScrollContext';
import React from 'react';
import { Text, View, ScrollView, Animated } from 'react-native';

const OtherProfileInfoView = () => {

    const scrollY = useScroll() || new Animated.Value(0);

    return (
        <ScrollView
            contentContainerStyle={{ paddingVertical: 10 }}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
        >
            <View style={{
                flex: 1,
                padding: 20
            }}>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoView</Text>
                <Text>OtherProfileInfoViewLastLine</Text>
            </View>
        </ScrollView>
    );
};

export default OtherProfileInfoView;