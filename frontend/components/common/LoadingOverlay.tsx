import {ActivityIndicator, Modal, StyleSheet, View} from "react-native";
import React from "react";

interface LoadingOverlayProps {
    isLoading: boolean;
}

export default function LoadingOverlay(props: LoadingOverlayProps) {
    return (
        <Modal visible={props.isLoading} transparent>
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    }
})