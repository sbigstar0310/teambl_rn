import React, { useState } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import DownArrow from "@/assets/setting/down-arrow-icon.svg";

interface TitleAndContentToggleProps {
    children: React.ReactNode;
    title: string;
}

const TitleAndContentToggle: React.FC<TitleAndContentToggleProps> = ({
    children,
    title,
}) => {
    const [isToggleOpen, setIsToggleOpen] = useState<boolean>(false);
    const [rotation] = useState(new Animated.Value(0));

    const toggleContent = () => {
        setIsToggleOpen(!isToggleOpen);
        Animated.timing(rotation, {
            toValue: isToggleOpen ? 0 : 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start();
    };

    const rotateInterpolate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    return (
        <>
            <TouchableOpacity
                style={styles.titleContainer}
                onPress={toggleContent}
            >
                <Text style={styles.title}>{title}</Text>
                <Animated.View
                    style={{ transform: [{ rotate: rotateInterpolate }] }}
                >
                    <DownArrow />
                </Animated.View>
            </TouchableOpacity>
            {isToggleOpen && (
                <View style={styles.contentContainer}>{children}</View>
            )}
        </>
    );
};

const ArrowIcon: React.FC = () => (
    <View style={styles.iconContainer}>
        <View style={styles.arrow} />
    </View>
);

const styles = StyleSheet.create({
    titleContainer: {
        paddingVertical: 14,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        color: "#121212",
        fontFamily: "Pretendard",
        fontSize: 16,
        fontWeight: "600",
    },
    iconContainer: {
        marginLeft: 10,
    },
    arrow: {
        width: 12,
        height: 12,
        borderTopWidth: 2, // 더 두꺼운 선으로 확인 가능
        borderRightWidth: 2,
        borderColor: "#A8A8A8",
        transform: [{ rotate: "45deg" }],
    },
    contentContainer: {
        marginTop: 10,
    },
});

export default TitleAndContentToggle;
