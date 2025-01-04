import {Text, View} from "react-native";
import {sharedStyles} from "@/app/_layout";

export default function ProjectsScreen() {
    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding]}>
            <Text>Projects Screen</Text>
        </View>
    )
}