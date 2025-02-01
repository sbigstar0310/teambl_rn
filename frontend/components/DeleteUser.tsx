import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import PrimeButton from "./PrimeButton";
import { router } from "expo-router";
import Popup from "@/components/Popup";
import checkPasswordAPI from "@/libs/apis/User/checkPassword";
import deleteUserAPI from "@/libs/apis/User/deleteUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/shared/constants";
import PasswordConfirmMessage from "@/components/settings/PasswordConfirmMessage";
import InputWithTitle from "./settings/InputWithTitle";

const DeleteUser: React.FC = () => {
    const [passwd, setPasswd] = useState<string>("");
    const [isPasswdValid, setIsPasswdValid] = useState<boolean | null>(null);
    const [isPasswordVerificationLoading, setIsPasswordVerificationLoading] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] =
        useState<boolean>(false);
    const [isFailModalOpen, setIsFailModalOpen] = useState<boolean>(false);

    const infoMessageContent = useMemo(() => {
        if (passwd === "") return "";
        if (isLoading || isPasswordVerificationLoading) return "";
        if (isPasswdValid === null) return "";

        return isPasswdValid
            ? "비밀번호가 일치합니다"
            : "비밀번호가 일치하지 않습니다";
    }, [passwd, isLoading, isPasswordVerificationLoading, isPasswdValid]);

    /** Check password */
    const checkCurrentPasswd = async () => {
        setIsPasswordVerificationLoading(true);
        try {
            const isValid = await checkPasswordAPI({ password: passwd }).then(
                (res) => res.isSame ?? false
            );
            setIsPasswdValid(isValid);
            return isValid;
        } catch (error) {
            console.error("비밀번호 확인 오류:", error);
            setIsPasswdValid(null);
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
        setIsPasswdValid(null);
    }, [passwd]);

    return (
        <View style={styles.container}>
            {/* Password Input */}
            <InputWithTitle
                title={"현 비밀번호"}
                value={passwd}
                onChangeText={setPasswd}
                secureTextEntry
            />
            <PasswordConfirmMessage
                isVerified={isPasswdValid}
                isActive={passwd.length > 0 && isPasswdValid !== null}
                infoMessage={infoMessageContent}
            />

            {/* Delete Button */}
            <PrimeButton
                text="회원 탈퇴"
                onClickCallback={deleteUserWrapper}
                isActive={
                    !(isLoading || isPasswordVerificationLoading) &&
                    passwd.length > 0
                }
                isLoading={isLoading || isPasswordVerificationLoading}
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
        backgroundColor: "#fff",
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
