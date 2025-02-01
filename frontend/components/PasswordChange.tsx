import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import changePasswordAPI from "@/libs/apis/User/changePassword";
import checkPasswordAPI from "@/libs/apis/User/checkPassword";
import Button from "./Button";
import ConfirmText from "./ConfirmText";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/shared/constants";
import InputWithTitle from "./settings/InputWithTitle";
import PasswordConfirmMessage from "./settings/PasswordConfirmMessage";

const PasswordChange: React.FC = () => {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            const storedUserId = await AsyncStorage.getItem("userId");
            setUserId(storedUserId);
        };
        fetchUserId();
    }, []);

    /** data states */
    const [prevPasswd, setPrevPasswd] = useState<string>("");
    const [afterPasswd, setAfterPasswd] = useState<string>("");
    const [reAfterPasswd, setReAfterPasswd] = useState<string>("");

    /** meta states */
    const [isPrevPasswdValid, setIsPrevPasswdValid] = useState<boolean>(true);
    const [isAfterPasswdVerified, setIsAfterPasswdVerified] =
        useState<boolean>(false);

    /** loading */
    const [isPasswordVerificationLoading, setIsPasswordVerificationLoading] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /** info message */
    const infoMessageContent = useMemo(() => {
        if (isPasswordVerificationLoading) return "";
        if (prevPasswd === "") return "";
        if (!isPrevPasswdValid) return "현 비밀번호가 일치하지 않습니다";
        if (afterPasswd === "" || reAfterPasswd === "") return "";
        return isAfterPasswdVerified
            ? "비밀번호가 일치합니다"
            : "비밀번호가 일치하지 않습니다";
    }, [
        reAfterPasswd,
        isPrevPasswdValid,
        isAfterPasswdVerified,
        isPasswordVerificationLoading,
    ]);

    /** checkers */
    const checkCurrentPasswd = async () => {
        setIsPasswordVerificationLoading(true);
        try {
            const isSame = await checkPasswordAPI({
                password: prevPasswd,
            }).then((res) => res.isSame ?? false);
            console.log("isSame", isSame);
            setIsPrevPasswdValid(isSame);
            return isSame;
        } catch (error) {
            setIsPrevPasswdValid(false);
            return false;
        } finally {
            setIsPasswordVerificationLoading(false);
        }
    };

    /** handler */
    const postNewPasswordQuestion = async () => {
        if (
            isPasswordVerificationLoading ||
            isLoading ||
            !isAfterPasswdVerified
        ) {
            return;
        }

        const res = await checkCurrentPasswd();
        if (res) {
            Alert.alert("확인", "정말 비밀번호를 변경하시겠어요?", [
                { text: "취소", style: "cancel" },
                { text: "확인", onPress: () => changePassword() },
            ]);
        }
    };

    const changePassword = async () => {
        try {
            setIsLoading(true);

            // 현 비밀번호 확인
            if (await checkCurrentPasswd()) {
                setIsPrevPasswdValid(true);
            } else {
                setIsPrevPasswdValid(false);
                setIsLoading(false);
                return;
            }

            // 비밀번호 변경
            const data = await changePasswordAPI({
                new_password: afterPasswd,
            });
            console.log(data);

            Alert.alert("성공", "비밀번호가 변경되었습니다.");
            await AsyncStorage.removeItem(ACCESS_TOKEN);
            await AsyncStorage.removeItem(REFRESH_TOKEN);
            router.push("/login");
            setIsLoading(false);
        } catch (error) {
            Alert.alert(
                "오류",
                "비밀번호 변경에 실패했습니다. 서버 오류가 발생했습니다."
            );
            setIsLoading(false);
            console.error(error);
        }
    };

    /** effects */
    useEffect(() => {
        if (afterPasswd.length > 0 && reAfterPasswd.length > 0) {
            setIsAfterPasswdVerified(afterPasswd === reAfterPasswd);
        } else {
            setIsAfterPasswdVerified(false);
        }
    }, [afterPasswd, reAfterPasswd]);

    return (
        <View style={styles.container}>
            <InputWithTitle
                title="현 비밀번호"
                value={prevPasswd}
                onChangeText={setPrevPasswd}
                secureTextEntry
            />
            <InputWithTitle
                title="새 비밀번호"
                value={afterPasswd}
                onChangeText={setAfterPasswd}
                secureTextEntry
                style={{ marginTop: 8 }}
            />
            <InputWithTitle
                title="새 비밀번호 확인"
                value={reAfterPasswd}
                onChangeText={setReAfterPasswd}
                secureTextEntry
                style={{ marginTop: 8 }}
            />
            <PasswordConfirmMessage
                isVerified={isAfterPasswdVerified && isPrevPasswdValid}
                isActive={afterPasswd.length > 0 && reAfterPasswd.length > 0}
                infoMessage={infoMessageContent}
            />
            <Button
                text={"비밀번호 변경"}
                onClickCallback={changePassword}
                isActive={isAfterPasswdVerified}
                isLoading={false}
                style={{ height: 40 }}
            ></Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    inputContainer: {
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
        gap: 16,
    },
    title: {
        fontSize: 16,
        fontFamily: "Pretendard",
        fontWeight: "400",
        marginBottom: 8,
        minWidth: 112,
        textAlign: "left",
        alignSelf: "center",
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    infoMessage: {
        marginTop: 4,
        fontSize: 12,
        color: "red",
    },
    button: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 4,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontFamily: "Pretendard",
        fontWeight: "600",
    },
    buttonDisabled: {
        backgroundColor: "#aaa",
    },
});

export default PasswordChange;
