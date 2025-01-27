import { sharedStyles } from "@/app/_layout";
import NewProfileHeader from "@/components/NewProfileHeader";
import theme from "@/shared/styles/theme";
import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyProfileLayout() {

    const router = useRouter();
    const myId = 1;

    return (
        <View
            style={[sharedStyles.coloredContainer]}
        >
            <SafeAreaView
                edges={['top']}
            >
                <NewProfileHeader
                    userId={myId}
                    isMyProfile={true}
                    onBackClick={() => {
                        router.replace("/home");
                    }}
                />
            </SafeAreaView>
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