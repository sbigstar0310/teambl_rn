import { sharedStyles } from "@/app/_layout";
import NewProfileHeader from "@/components/NewProfileHeader";
import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function MyProfileLayout() {

    return (
        <View
            style={[ sharedStyles.coloredContainer ]}
        >
            <NewProfileHeader
                userId={1}
                isMyProfile={true}
            />
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </View>
    );
}