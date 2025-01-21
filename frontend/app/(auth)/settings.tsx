import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import TitleAndContentToggle from "@/components/TitleAndContentToggle";
import PasswordChange from "@/components/PasswordChange";
import InquirySend from "@/components/InquirySend";
import DeleteUser from "@/components/DeleteUser";
import PolicyView from "@/components/PolicyView";
import ScreenHeader from "@/components/common/ScreenHeader";
import { sharedStyles } from "@/app/_layout";

const Setting: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    return (
        <View style={sharedStyles.container}>
            <ScreenHeader title={"설정"} />
            <ScrollView style={sharedStyles.horizontalPadding}>
                <View style={styles.marginTop22}>
                    <TitleAndContentToggle title="비밀번호 변경">
                        <PasswordChange />
                    </TitleAndContentToggle>
                    <View style={styles.transBorder} />
                    <TitleAndContentToggle title="문의하기">
                        <InquirySend />
                    </TitleAndContentToggle>
                    <View style={styles.transBorder} />
                    <TitleAndContentToggle title="회원 탈퇴">
                        <DeleteUser />
                    </TitleAndContentToggle>
                    <View style={styles.transBorder} />
                    <TitleAndContentToggle title="약관 및 정책">
                        <PolicyView />
                    </TitleAndContentToggle>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    body: {
        width: "100%",
    },
    backButtonContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#ffffff",
        marginBottom: 20,
    },
    backButton: {
        width: 20,
        backgroundColor: "transparent",
    },
    backIcon: {
        width: 20,
        height: 16,
    },
    title: {
        width: "100%",
        textAlign: "left",
        color: "#121212",
        fontFamily: "Pretendard",
        fontSize: 20,
        fontWeight: "600",
        letterSpacing: -0.38,
    },
    marginTop22: {
        marginTop: 22,
    },
    transBorder: {
        width: "100%",
        height: 16,
        backgroundColor: "none",
    },
});

export default Setting;
