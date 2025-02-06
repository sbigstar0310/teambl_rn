import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import theme from "@/shared/styles/theme";

interface PostInteractionsProps {
    likes: number,
    comments: number,
    onOptions?: () => void;
    onLike?: () => void;
    onComment?: () => void;
}

export default function PostInteractions(props: PostInteractionsProps) {
    return (
        <View style={styles.container}>
            {/* Indicators: like & comment */}
            <View style={styles.indicatorsContainer}>
                {/* Likes */}
                <TouchableOpacity style={styles.indicator} onPress={props.onLike}>
                    <FontAwesome6 name="heart" size={20} color={theme.colors.achromatic01}/>
                    <Text style={styles.indicatorText}>{props.likes}</Text>
                </TouchableOpacity>
                {/* Comments */}
                <TouchableOpacity style={styles.indicator} onPress={props.onComment}>
                    <FontAwesome6 name="comment" size={20} color={theme.colors.achromatic01}/>
                    <Text style={styles.indicatorText}>{props.comments}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={props.onOptions} style={styles.optionsButtonContainer}>
                <FontAwesome6 name="ellipsis-vertical" size={20} color={theme.colors.achromatic03}/>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row"
    },
    indicatorsContainer: {
        flexGrow: 1,
        flexDirection: "row",
        gap: 16
    },
    indicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    indicatorText: {
        fontSize: 14,
        color: theme.colors.achromatic01
    },
    optionsButtonContainer: {
        paddingLeft: 24
    }
})