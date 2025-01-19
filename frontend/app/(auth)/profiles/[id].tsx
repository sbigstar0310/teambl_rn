import { sharedStyles } from "@/app/_layout";
import {Redirect, useLocalSearchParams} from "expo-router";
import { View, Text } from "react-native";

export default function ProfileView() {
    const {id} = useLocalSearchParams();

    const myId = "1"; // TODO: get my id from the auth context
    
    if (id === myId) {
        return <Redirect href={"../(tabs)/myprofile"} />;
    } else {
        return (
            <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding]}>
                <Text>{`Profile page for the id : ${id} (TBD)`}</Text>
            </View>
        );
    }
}

const IdNotFound = () => {
    return (
        <View style={[sharedStyles.container, sharedStyles.contentCentered, sharedStyles.horizontalPadding]}>
            <Text>Id not found</Text>
        </View>
    );
};