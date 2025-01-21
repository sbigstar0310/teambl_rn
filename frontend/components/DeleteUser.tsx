import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import PrimeButton from "./PrimeButton";
import { router } from "expo-router";
import Popup from "@/components/Popup";
import checkPasswordAPI from "@/libs/apis/checkPassword";
import deleteUserAPI from "@/libs/apis/deleteUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/shared/constants";

const DeleteUser: React.FC = () => {
    const [passwd, setPasswd] = useState<string>("");
    const [isPrevPasswdValid, setIsPrevPasswdValid] = useState<boolean | null>(
        null
    );
    const [isPasswordVerificationLoading, setIsPasswordVerificationLoading] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] =
        useState<boolean>(false);
    const [isFailModalOpen, setIsFailModalOpen] = useState<boolean>(false);

    const infoMessageContent = useMemo(() => {
        if (passwd === "") return "";
        if (isLoading || isPasswordVerificationLoading) return "";
        if (isPrevPasswdValid === null) return "";

        return isPrevPasswdValid
            ? { status: "good", message: "비밀번호가 일치합니다" }
            : { status: "bad", message: "비밀번호가 일치하지 않습니다" };
    }, [passwd, isLoading, isPasswordVerificationLoading, isPrevPasswdValid]);

    /** Check password */
    const checkCurrentPasswd = async () => {
        setIsPasswordVerificationLoading(true);
        try {
            const isValid = await checkPasswordAPI({ password: passwd }).then(
                (res) => res.isSame ?? false
            );
            setIsPrevPasswdValid(isValid);
            return isValid;
        } catch (error) {
            console.error("비밀번호 확인 오류:", error);
            setIsPrevPasswdValid(false);
            return false;
        } finally {
            setIsPasswordVerificationLoading(false);
        }
    };

    /** Delete user logic */
    const deleteUserWrapper = async () => {
        if (isLoading || isPasswordVerificationLoading) return;

        const res = await checkCurrentPasswd();
        if (res) {
            setIsConfirmModalOpen(true);
        }
    };

    const deleteUser = async () => {
        setIsLoading(true);
        try {
            await deleteUserAPI();
            Alert.alert("성공", "회원 탈퇴가 완료되었습니다.");
            AsyncStorage.removeItem(ACCESS_TOKEN);
            AsyncStorage.removeItem(REFRESH_TOKEN);
            router.push("/login");
        } catch (error) {
            console.error("회원 탈퇴 오류:", error);
            setIsFailModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsPrevPasswdValid(null);
    }, [passwd]);

    return (
        <View style={styles.container}>
            {/* Password Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>현 비밀번호</Text>
                <TextInput
                    style={styles.input}
                    value={passwd}
                    onChangeText={setPasswd}
                    secureTextEntry
                    placeholder="비밀번호를 입력하세요"
                />
                {infoMessageContent &&
                    typeof infoMessageContent === "object" && (
                        <Text
                            style={[
                                styles.infoMessage,
                                infoMessageContent.status === "good"
                                    ? styles.good
                                    : styles.bad,
                            ]}
                        >
                            {infoMessageContent.message}
                        </Text>
                    )}
            </View>

            {/* Delete Button */}
            <PrimeButton
                text="회원 탈퇴"
                onClickCallback={deleteUserWrapper}
                isActive={!(isLoading || isPasswordVerificationLoading)}
                isLoading={isLoading || isPasswordVerificationLoading}
                styleOv={{ marginTop: 18 }}
            />

            {/* Confirmation Modal */}
            <Popup
                title="정말 회원 탈퇴하시겠어요?"
                isVisible={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={async () => {
                    setIsConfirmModalOpen(false);
                    await deleteUser();
                }}
            />
            {/* Failure Message */}
            <Popup
                title="회원 탈퇴에 실패했어요."
                description="서버 상의 오류가 발생했습니다."
                isVisible={isFailModalOpen}
                onClose={() => setIsFailModalOpen(false)}
                closeLabel="확인"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: "#121212",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        backgroundColor: "#f5f5f5",
    },
    infoMessage: {
        marginTop: 8,
        fontSize: 12,
    },
    good: {
        color: "green",
    },
    bad: {
        color: "red",
    },
});

export default DeleteUser;
