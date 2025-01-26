import { sharedStyles } from "@/app/_layout";
import NewProfileHeader from "@/components/NewProfileHeader";
import theme from "@/shared/styles/theme";
import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyProfileLayout() {

    const router = useRouter();

    return (
        <View
            style={[sharedStyles.coloredContainer]}
        >
            <SafeAreaView
                edges={['top']}
            >
                <NewProfileHeader
                    userId={1}
                    isMyProfile={true}
                    onBackClick={() => {
                        router.push("/home");
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