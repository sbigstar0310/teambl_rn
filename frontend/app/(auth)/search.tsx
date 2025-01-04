import {Text, View} from "react-native";
import {sharedStyles} from "@/app/_layout";

export default function SearchScreen() {
    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding]}>
            <Text>Search Screen</Text>
        </View>
    )
}