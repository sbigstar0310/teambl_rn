import theme from "@/shared/styles/theme";
import React from "react";
import {
    StyleSheet,
    Text,
    Touchable,
    TouchableOpacity,
    View,
} from "react-native";
import CopyLinkIcon from "@/assets/CopyLinkIcon.svg";
import ReportIcon from "@/assets/ReportIcon.svg";
import DeleteIcon from "@/assets/DeleteIcon.svg";
import LeaveIcon from "@/assets/LeaveIcon.svg";
import EditPencilIcon from "@/assets/EditPencilIcon.svg";
import PlusPencilIcon from "@/assets/PlusPencilIcon.svg";

const options = [
    "NEWPOST",
    "COPYLINK",
    "EDITPROJECT",
    "LEAVEPROJECT",
    "REPORT",
];

const InlineIconButton = (props: any) => {
    const { type = "COPYLINK", onPress = () => {} } = props;

    if (!options.includes(type)) {
        throw new Error("Invalid button type.");
    }

    const getColorTheme = (type: string) => {
        switch (type) {
            case "DELETEPROJECT":
                return styles.withMessage2;
            case "LEAVEPROJECT":
                return styles.withMessage2;
            default:
                return styles.withBlack;
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "COPYLINK":
                return <CopyLinkIcon />;
            case "NEWPOST":
                return <PlusPencilIcon />;
            case "EDITPROJECT":
                return <EditPencilIcon />;
            case "LEAVEPROJECT":
                return <LeaveIcon />;
            case "REPORT":
                return <ReportIcon />;
            default:
                return <CopyLinkIcon />;
        }
    };

    const getButtonText = (type: string) => {
        switch (type) {
            case "COPYLINK":
                return "링크 복사";
            case "NEWPOST":
                return "이 프로젝트에서 새 게시물 작성";
            case "EDITPROJECT":
                return "프로젝트 수정";
            case "LEAVEPROJECT":
                return "프로젝트 나가기";
            case "REPORT":
                return "신고";
            default:
                return "링크 복사";
        }
    };

    return (
        <TouchableOpacity style={[styles.container]} onPress={onPress}>
            <View style={styles.circleContainer}>{getIcon(type)}</View>
            <Text style={[styles.buttonText, getColorTheme(type)]}>
                {getButtonText(type)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 20,
        paddingVertical: 16,
    },
    circleContainer: {
        width: 24,
        height: 24,
        padding: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    withBlack: {
        color: theme.colors.black,
        borderColor: theme.colors.black,
    },
    withMessage2: {
        color: theme.colors.message2,
        borderColor: theme.colors.message2,
    },
    buttonText: {
        fontSize: theme.fontSizes.body1,
        fontWeight: 400,
    },
});

export default InlineIconButton;
