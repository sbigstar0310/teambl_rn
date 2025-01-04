import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {FC} from "react";
import {router} from "expo-router";

interface ScreenHeaderProps {
    title?: string | FC;
    actionButton?: FC;
}

export default function ScreenHeader(props: ScreenHeaderProps) {
    const handleBackButton = router.back;

    return (
        <View style={styles.container}>
            {/* Backward button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
                <Image source={require('@/assets/left-arrow.png')} style={styles.backIcon}/>
            </TouchableOpacity>
            {/* Optionally provided extra details */}
            {/* e.g. Screen title */}
            <View style={styles.extraContainer}>
                {props.title && (
                    typeof props.title === "string"
                        ? <Text style={styles.title}>{props.title}</Text>
                        : <props.title/>
                )}
                {props.actionButton && <props.actionButton/>}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 10
    },
    backButton: {
        padding: 10,
    },
    backIcon: {
        width: 20,
        height: 16
    },
    extraContainer: {
        flexGrow: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: "bold"
    }
})