import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from "expo-router";

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
  const [isAfterPasswdVerified, setIsAfterPasswdVerified] = useState<boolean>(false);

  /** loading */
  const [isPasswordVerificationLoading, setIsPasswordVerificationLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** info message */
  const infoMessageContent = useMemo(() => {
    if (isPasswordVerificationLoading) {
      return "";
    }
    if (prevPasswd === "") {
      return "";
    } else {
      if (!isPrevPasswdValid) {
        return "현 비밀번호가 일치하지 않습니다";
      } else {
        if (afterPasswd === "" || reAfterPasswd === "") {
          return "";
        } else {
          return isAfterPasswdVerified
            ? "비밀번호가 일치합니다"
            : "비밀번호가 일치하지 않습니다";
        }
      }
    }
  }, [isPrevPasswdValid, isAfterPasswdVerified, isPasswordVerificationLoading]);

  /** checkers */
  const checkCurrentPasswd = async (): Promise<boolean> => {
    setIsPasswordVerificationLoading(true);
    try {
      // Simulate API response
      setTimeout(() => {
        setIsPrevPasswdValid(prevPasswd === "dummyOldPassword");
        setIsPasswordVerificationLoading(false);
      }, 1000);
      return prevPasswd === "dummyOldPassword";
    } catch (error) {
      setIsPrevPasswdValid(false);
      return false;
    } finally {
      setIsPasswordVerificationLoading(false);
    }
  };

  /** handler */
  const postNewPasswordQuestion = async () => {
    if (isPasswordVerificationLoading || isLoading || !isAfterPasswdVerified) {
      return;
    }

    const res = await checkCurrentPasswd();
    if (res) {
      Alert.alert(
        "확인",
        "정말 비밀번호를 변경하시겠어요?",
        [
          { text: "취소", style: "cancel" },
          { text: "확인", onPress: () => postNewPassword() },
        ]
      );
    }
  };

  const postNewPassword = async () => {
    setIsLoading(true);
    try {
      // Simulate API response
      setTimeout(async () => {
        Alert.alert("성공", "비밀번호가 변경되었습니다.");
        await AsyncStorage.clear();
        router.push("/login")
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert("오류", "비밀번호 변경에 실패했습니다. 서버 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  /** effects */
  useEffect(() => {
    setIsAfterPasswdVerified(afterPasswd === reAfterPasswd);
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
        infoMessage={infoMessageContent}
        style={{ marginTop: 8 }}
      />
      <TouchableOpacity
        style={[styles.button, isLoading || isPasswordVerificationLoading ? styles.buttonDisabled : null]}
        onPress={postNewPasswordQuestion}
        disabled={isLoading || isPasswordVerificationLoading}
      >
        {isLoading || isPasswordVerificationLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>저장</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

type InputWithTitleProps = {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  infoMessage?: string;
  style?: object;
};

const InputWithTitle: React.FC<InputWithTitleProps> = ({ title, value, onChangeText, secureTextEntry, infoMessage, style }) => (
  <View style={[styles.inputContainer, style]}>
    <Text style={styles.title}>{title}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
    {infoMessage && <Text style={styles.infoMessage}>{infoMessage}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  infoMessage: {
    marginTop: 4,
    fontSize: 12,
    color: 'red',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
});

export default PasswordChange;