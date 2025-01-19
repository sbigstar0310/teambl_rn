import {StyleSheet, Text, View} from "react-native";

export default function UnreadIndicator() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>N</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#2546F3",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 500,
        width: 16,
        height: 16,
    },
    text: {
        fontSize: 10,
        fontWeight: "bold",
        color: "white"
    }
})