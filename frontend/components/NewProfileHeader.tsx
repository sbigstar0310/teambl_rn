import theme from '@/shared/styles/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import ChonIcon from '@/assets/chon-icon.svg';
import PadoIcon from '@/assets/pado-icon.svg';

const NewProfileHeader = (props: any) => {

    const router = useRouter();
    
    const {
        userId: string,
        isMyProfile: boolean,
        onBackClick
    } = props;

    const fetchUserInfo = async () => {
        // TODO
    }

    return (
        <View
            style={[styles.container]}
        >
            {/** back button */}
            {/* <View
                style={[styles.backbuttonContainer]}
            >
                <TouchableOpacity onPress={onBackClick}>
                    <Image
                        source={require("@/assets/left-arrow.png")}
                    />
                </TouchableOpacity>
            </View> */}
            <View
                style={[styles.headerContainer]}
            >
                <Image
                    source={{
                        uri: "https://image.fnnews.com/resource/media/image/2024/10/10/202410100737527065_l.jpg"
                    }}
                    style={[styles.profileImage]}
                />
                <View
                    style={[styles.nameContainer]}
                >
                    <Text
                        style={[styles.name]}
                    >
                        {"성이름"}
                    </Text>
                    {props.isMyProfile && (
                        <TouchableOpacity
                            style={[styles.editButton]}
                            onPress={
                                () => {
                                    router.push("/myprofile-edit");
                                }
                            }
                        >
                            <Image
                                source={require("@/assets/edit-icon.png")}
                                style={[styles.editButtonIcon]}
                            />
                        </TouchableOpacity>
                    )}
                    {
                        !(props.isMyProfile) &&
                        <Text>
                            {"・ 1촌"}
                        </Text>
                    }
                </View>
                <View
                    style={[styles.schoolContainer]}
                >
                    <Text
                        style={[styles.schoolInfo]}
                    >
                        {"카이스트"}
                    </Text>
                    <Text
                        style={[styles.sepLine]}
                    >
                        {"|"}
                    </Text>
                    <Text
                        style={[styles.schoolInfo]}
                    >
                        {"학사"}
                    </Text>
                    <Text
                        style={[styles.sepLine]}
                    >
                        {"|"}
                    </Text>
                    <Text
                        style={[styles.schoolInfo]}
                    >
                        {"18 학번"}
                    </Text>
                </View>
                <View
                    style={[styles.schoolContainer]}
                >
                    <Text
                        style={[styles.schoolInfo]}
                    >
                        {"전산학부"}
                    </Text>
                    <Text
                        style={[styles.sepDot]}
                    >
                        {"・"}
                    </Text>
                    <Text
                        style={[styles.schoolInfo]}
                    >
                        {"산업디자인과"}
                    </Text>
                </View>
                {/*** bottom view */}
                <View
                    style={[styles.bottomContainer]}
                >
                    <TouchableOpacity
                        style={[styles.bottomButton, styles.withMR17]}
                    >
                        <ChonIcon
                            style={[styles.bottomButtonIcon]}
                        />
                        <Text
                            style={[styles.bottomButtonText]}
                        >
                            {"1촌 32명"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bottomButton]}
                    >
                        <PadoIcon
                            style={[styles.bottomButtonIcon]}
                        />
                        <Text
                            style={[styles.bottomButtonText]}
                        >
                            {"파도타기"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        paddingTop: 80
    },
    backbuttonContainer: {
        paddingVertical: 16,
        paddingHorizontal: 22,
    },
    headerContainer: {
        backgroundColor: theme.colors.white,
        paddingTop: 15,
        paddingBottom: 30,
        marginTop: 17,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderColor: theme.colors.white,
        borderWidth: 4,
        position: 'absolute',
        top: -45,
    },
    nameContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        gap: 4
    },
    name: {
        fontSize: theme.fontSizes.smallTitle,
        fontWeight: 600,
        color: theme.colors.black
    },
    editButton: {
        width: 22,
        height: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    editButtonIcon: {
        width: 20,
        height: 20
    },
    chon : {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black
    },
    schoolContainer : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    schoolInfo: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        marginHorizontal: 3
    },
    sepLine : {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        paddingBottom: 3,
        marginHorizontal: 3
    },
    sepDot : {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        marginHorizontal: 3
    },
    bottomContainer : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 7
    },
    bottomButton : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    withMR17 : {
        marginRight: 17
    },
    bottomButtonIcon : {
        width: 20,
        height: 20,
        marginRight: 5
    },
    bottomButtonText : {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.main,
        fontWeight: 500
    }
});


export default NewProfileHeader;