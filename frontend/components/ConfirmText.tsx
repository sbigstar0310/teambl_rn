import React from "react";
import { StyleSheet, Text, View, ViewStyle, TextStyle } from "react-native";
import SuccessMark from "@/assets/successExclamation.svg";
import ErrorMark from "@/assets/errorExclamation.svg";

// Props 타입 정의
type ConfirmTextProps = {
    isVerified: boolean; // 인증 여부
    isActive: boolean; // 활성화 여부
    successText: string; // 성공 메시지
    errorText: string; // 실패 메시지
    containerStyle?: ViewStyle; // 컨테이너 커스텀 스타일
    textStyle?: TextStyle; // 텍스트 커스텀 스타일
    iconStyle?: ViewStyle; // 아이콘 커스텀 스타일
};

const ConfirmText: React.FC<ConfirmTextProps> = ({
    isVerified,
    isActive,
    successText,
    errorText,
    containerStyle,
    textStyle,
    iconStyle,
}) => {
    // 텍스트와 아이콘 렌더링 함수
    const renderConfirmText = () => {
        if (!isActive) {
            // 활성화되지 않았을 때 동일한 높이를 가진 빈 뷰 반환
            return (
                <View style={[styles.container, containerStyle]}>
                    <View style={[styles.icon, iconStyle]} />
                    <Text style={[styles.confirmText, textStyle]}>{""} </Text>
                </View>
            );
        }

        return isVerified ? (
            <View style={[styles.container, containerStyle]}>
                <SuccessMark style={[styles.icon, iconStyle]} />
                <Text
                    style={[
                        styles.confirmText,
                        styles.successText,
                        textStyle, // 커스텀 스타일 적용
                    ]}
                >
                    {successText}
                </Text>
            </View>
        ) : (
            <View style={[styles.container, containerStyle]}>
                <ErrorMark style={[styles.icon, iconStyle]} />
                <Text
                    style={[
                        styles.confirmText,
                        styles.errorText,
                        textStyle, // 커스텀 스타일 적용
                    ]}
                >
                    {errorText}
                </Text>
            </View>
        );
    };

    return <>{renderConfirmText()}</>;
};

// 스타일 정의
const styles = StyleSheet.create({
    confirmText: {
        fontSize: 12,
        marginLeft: 4, // 아이콘과 텍스트 간격 조절
    },
    successText: {
        color: "#42A513", // 성공 색상
    },
    errorText: {
        color: "#B80000", // 에러 색상
    },
    container: {
        flexDirection: "row", // 아이콘과 텍스트 가로 배치
        alignItems: "center",
        marginTop: 8,
        marginBottom: 14,
    },
    icon: {
        margin: 2, // 아이콘과 텍스트 간격 조절
        width: 16,
        height: 16,
    },
});

export default ConfirmText;
