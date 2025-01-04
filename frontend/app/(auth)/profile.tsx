import {Text, View} from "react-native";
import {sharedStyles} from "@/app/_layout";

export default function ProfileScreen() {
    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding]}>
            <Text>Profile Screen</Text>
        </View>
    )
}