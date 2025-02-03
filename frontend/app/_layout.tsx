import theme from "@/shared/styles/theme";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {Fragment} from 'react';
import {StyleSheet} from "react-native";
import { useFonts } from "expo-font";

export default function RootLayout() {
    // 폰트 로드
    const [fontsLoaded] = useFonts({
        Pretendard: require("../assets/fonts/PretendardVariable.ttf"),
        PretendardRegular: require("../assets/fonts/Pretendard-Regular.ttf"),
        PretendardSemiBold: require("../assets/fonts/Pretendard-SemiBold.ttf"),
    });
    if (!fontsLoaded) {
        return null; // 폰트가 로드될 때까지 화면을 렌더링하지 않음
    }
    return <Fragment>
        {/* Main Stack navigation router */}
        <Stack screenOptions={{headerShown: false}}/>
        <StatusBar style="light" translucent={false} backgroundColor="black"/>
    </Fragment>;
}

export const sharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    horizontalPadding: {
        paddingHorizontal: 16
    },
    contentCentered: {
        justifyContent: "center",
        alignItems: "center"
    },
    primaryText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    secondaryText: {
        fontSize: 12,
        color: "gray"
    },
    rounded: {
        borderRadius: 500
    },
    roundedSm: {
        borderRadius: 5
    },
    coloredContainer : {
        backgroundColor: theme.colors.background2,
        flex: 1,
        paddingTop: 0,
        paddingBottom: 0
    }
})