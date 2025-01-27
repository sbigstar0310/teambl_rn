import {Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {FC} from "react";
import {router} from "expo-router";
import {sharedStyles} from "@/app/_layout";

interface ScreenHeaderProps {
    title?: string | FC;
    actionButton?: FC;
    onBack?(): void;
}

export default function ScreenHeader(props: ScreenHeaderProps) {
    const handleBackButton = () => {
        if (props.onBack) props.onBack();
        else router.back();
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={[styles.container, sharedStyles.horizontalPadding]}>
                {/* Backward button */}
                <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
                    <Image
                        source={require("@/assets/left-arrow.png")}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                {/* Optionally provided extra details */}
                {/* e.g. Screen title */}
                <View style={styles.extraContainer}>
                    {props.title &&
                        (typeof props.title === "string" ? (
                            <Text style={styles.title}>{props.title}</Text>
                        ) : (
                            <props.title/>
                        ))}
                    {props.actionButton && <props.actionButton/>}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 0, // SafeArea 적용
        backgroundColor: "white", // SafeArea 배경색 설정
    },
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    backButton: {
        paddingTop: 16,
        paddingBottom: 20,
    },
    backIcon: {
        width: 20,
        height: 16,
    },
    extraContainer: {
        flexGrow: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
});
