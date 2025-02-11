import theme from '@/shared/styles/theme';
import React from 'react';
import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import CopyLinkIcon from '@/assets/CopyLinkIcon.svg';
import ReportIcon from '@/assets/ReportIcon.svg';
import DeleteIcon from '@/assets/DeleteIcon.svg';
import EditPencilIcon from '@/assets/EditPencilIcon.svg';
import QrCodeIcon from '@/assets/QrCodeIcon.svg';
import InviteLinkIcon from '@/assets/InviteLinkIcon.svg';

const options = [
    "COPYLINK", "REPORT", "DELETE", "EDIT", "QRCODE", "INVITELINK"
];

const CircularIconButton = (props: any) => {

    const {
        type="COPYLINK",
        onPress=()=>{}
    } = props;

    if (!options.includes(type)) {
        throw new Error("Invalid button type.");
    }

    const getColorTheme = (type: string) => {
        switch(type) {
            case "COPYLINK":
                return styles.withBlack;
            case "REPORT":
                return styles.withMessage2;
            case "DELETE":
                return styles.withMessage2;
            case "EDIT":
                return styles.withBlack;
            case "QRCODE":
                return styles.withBlack;
            case "INVITELINK":
                return styles.withBlack;
            default:
                return styles.withBlack;
        }
    };

    const getIcon = (type: string) => {
        switch(type) {
            case "COPYLINK":
                return <CopyLinkIcon />;
            case "REPORT":
                return <ReportIcon />;
            case "DELETE":
                return <DeleteIcon />;
            case "EDIT":
                return <EditPencilIcon />;
            case "QRCODE":
                return <QrCodeIcon />;
            case "INVITELINK":
                return <InviteLinkIcon />;
            default:
                return <CopyLinkIcon />;
        }
    };

    const getButtonText = (type: string) => {
        switch(type) {
            case "COPYLINK":
                return "링크 복사";
            case "REPORT":
                return "신고";
            case "DELETE":
                return "삭제";
            case "EDIT":
                return "수정";
            case "QRCODE":
                return "QR 코드";
            case "INVITELINK":
                return "초대 링크";
            default:
                return "링크 복사";
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.circleContainer,
                    getColorTheme(type)
                ]}
            >
                {getIcon(type)}
            </View>
            <Text
                style={[
                    styles.buttonText,
                    getColorTheme(type)
                ]}
            >
                {getButtonText(type)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container : {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 8
    },
    circleContainer : {
        width: 46,
        height: 46,
        borderWidth: 1,
        padding: 0,
        borderRadius: 23,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    withBlack : {
        color: theme.colors.black,
        borderColor: theme.colors.black
    },
    withMessage2 : {
        color: theme.colors.message2,
        borderColor: theme.colors.message2
    },
    buttonText : {
        fontSize: theme.fontSizes.body2,
        fontWeight: 400
    }
});

export default CircularIconButton;