import { useScroll } from '@/components/provider/ScrollContext';
import React from 'react';
import { Text, View, ScrollView, Animated, StyleSheet } from 'react-native';

const OtherProfileProjectView = () => {

    const scrollY = useScroll() || new Animated.Value(0);

    return (
        <ScrollView
            contentContainerStyle={{ paddingTop: 10 }}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
        >
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    
});

export default OtherProfileProjectView;