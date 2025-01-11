import { sharedStyles } from "@/app/_layout";
import NewProfileHeader from "@/components/NewProfileHeader";
import theme from "@/shared/styles/theme";
import { Stack, useRouter } from "expo-router";
import { View } from "react-native";

export default function MyProfileLayout() {

    const router = useRouter();

    return (
        <View
            style={[sharedStyles.coloredContainer]}
        >
            <NewProfileHeader
                userId={1}
                isMyProfile={true}
                onBackClick={() => {
                    router.push("/home");
                }}
            />
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.colors.black
                }}
            >
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </View>
        </View>
    );
}