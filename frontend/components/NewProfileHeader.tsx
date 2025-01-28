import theme from "@/shared/styles/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
    Text,
    Modal,
    ActivityIndicator,
} from "react-native";
import ChonIcon from "@/assets/chon-icon.svg";
import PadoIcon from "@/assets/pado-icon.svg";
import DefaultImage from "@/assets/DefaultProfile.svg";
import BackIcon from "@/assets/BackIcon.svg";
import ImageUploadModal from "./ImageUploadModal";
import PrimeButton from "./PrimeButton";
import SmallButton from "./buttons/SmallButton";
import RelationShipBridgeView from "./RelationShipBridgeView";
import updateProfile from "@/libs/apis/Profile/updateProfile";
import createFriend from "@/libs/apis/Friend/createFriend";

const MyProfileDummyData = {
    id: 1,
    profileImageUrl:
        "https://image.fnnews.com/resource/media/image/2024/10/10/202410100737527065_l.jpg",
    name: "성이름",
    school: "카이스트",
    degree: "학사",
    admissionYear: 18,
    chonDegree: 0,
    departments: ["전산학부", "산업디자인과"],
    chonCount: 32,
};

const OtherProfileDummyDataTwoChon = {
    id: 2,
    profileImageUrl:
        "https://i.namu.wiki/i/YrgbR0y6Q9LAd2ij9Yu7b1IxViYEzXmxOm6lH617nsOkVwa13wp4sEIwFwwTqoAqc_rqhft21sdcO388UKcGZw.webp",
    name: "김두촌",
    school: "카이스트",
    degree: "석사",
    admissionYear: 24,
    departments: ["전산학부", "김재철AI대학원"],
    chonCount: 30,
    isChon: false,
    chonDegree: 2,
    chonInfoFromMe: [
        { myName: "성이름", BridgeNames: ["김중간"] },
        { myName: "성이름", BridgeNames: ["박중간"] },
        { myName: "성이름", BridgeNames: ["James"] },
    ],
};

const OtherProfileDummyDataThreeChon = {
    id: 3,
    profileImageUrl:
        "https://mblogthumb-phinf.pstatic.net/MjAyMjA4MjdfMTA1/MDAxNjYxNTkwMDA1NjM1.XFF4jbmfPTQoLHyI7Trx4fb4JH4zeXFTVykFyqHjG_og.S7-DPx-F8kGoUG2oYY5wZmZ24kJCwgl_lGtxIhsOijUg.JPEG.dearmy098/76adcbd9441095dae1080cc53a9a727d.jpg?type=w800",
    name: "김삼촌",
    school: "카이스트",
    degree: "박사",
    admissionYear: 19,
    departments: ["전산학부", "전기및전자공학부"],
    chonCount: 15,
    isChon: false,
    chonDegree: 3,
    chonInfoFromMe: [
        { myName: "성이름", BridgeNames: ["김중간", "이중간"] },
        { myName: "성이름", BridgeNames: ["박중간", "최중간"] },
        { myName: "성이름", BridgeNames: ["James", "Tom"] },
    ],
};

const OtherProfileDummyDataFourChon = {
    id: 4,
    profileImageUrl:
        "https://blog.kakaocdn.net/dn/eyeYET/btrWoo5nDmr/MJPSlKZD1mNubibCMtRGbK/img.png",
    name: "김사촌",
    school: "카이스트",
    degree: "학사",
    admissionYear: 19,
    departments: ["생명과학과", "전기및전자공학부"],
    chonCount: 3,
    isChon: false,
    chonDegree: 4,
};

const oneChonProfileDummyData = {
    id: 5,
    profileImageUrl:
        "https://entertainimg.kbsmedia.co.kr/cms/uploads/PERSON_20241013124916_43de76d0e8469192a63783030a894944.png",
    name: "김일촌",
    school: "카이스트",
    degree: "학사",
    admissionYear: 19,
    departments: ["건설및환경공학과", "전기및전자공학부"],
    chonCount: 301,
    chonDegree: 1,
    isChon: true,
};

type ProfileDummyData = {
    id?: number;
    profileImageUrl?: string;
    name?: string;
    school?: string;
    degree?: string;
    admissionYear?: number;
    departments?: string[];
    chonCount?: number;
    isChon?: boolean;
    chonDegree?: number;
    chonInfoFromMe?: {
        myName: string;
        BridgeNames: string[];
    }[];
};

const NewProfileHeader = (props: any) => {
    const { userId, isMyProfile } = props;

    const router = useRouter();
    const myId = 1;

    const [isImageUploadModalVisible, setIsImageUploadModalVisible] =
        useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [userInfo, setUserInfo] = useState<ProfileDummyData>({});
    const [currentImageURL, setCurrentImageURL] = useState("");

    const fetchUserInfo = async () => {
        if (`${userId}` === `${myId}`) {
            setUserInfo(MyProfileDummyData);
        } else if (`${userId}` === "2") {
            setUserInfo(OtherProfileDummyDataTwoChon);
        } else if (`${userId}` === "3") {
            setUserInfo(OtherProfileDummyDataThreeChon);
        } else if (`${userId}` === "4") {
            setUserInfo(OtherProfileDummyDataFourChon);
        } else {
            setUserInfo(oneChonProfileDummyData);
        }
    };

    const uploadImage = async (file: any): Promise<void> => {
        try {
            setIsImageUploadModalVisible(false);
            setIsLoading(true);
            // TODO : backend
            console.log(file.uri);
            const newProfile = {
                image: file.uri,
            };
            await updateProfile(newProfile);
            setCurrentImageURL(file.uri);
        } catch (error) {
            console.error("파일 업로드 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = async () => {
        // TODO : backend
        setIsImageUploadModalVisible(false);
        setIsLoading(true);
        const newProfile = {
            image: "",
        };
        await updateProfile(newProfile);
        setIsLoading(false);
        setCurrentImageURL("");
    };

    const extractBridgeNames = (chonInfoFromMe: any) => {
        if (!chonInfoFromMe) {
            return [];
        }
        let newList: any[] = [];
        chonInfoFromMe.forEach((info: any) => {
            newList.push(info.BridgeNames);
        });
        return newList;
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        setCurrentImageURL(
            userInfo?.profileImageUrl ? userInfo.profileImageUrl : ""
        );
    }, [userInfo]);

    return (
        <>
            {/** loader */}
            {isLoading && (
                <Modal visible={true} transparent>
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                </Modal>
            )}
            <View
                style={
                    isMyProfile
                        ? styles.myProfilecontainer
                        : styles.otherProfilecontainer
                }
            >
                <View style={[styles.headerContainer]}>
                    <TouchableOpacity
                        style={[styles.profileImageContainer]}
                        onPress={() => {
                            if (isMyProfile) {
                                setIsImageUploadModalVisible(true);
                            }
                        }}
                    >
                        {currentImageURL === "" && (
                            <DefaultImage
                                width={90}
                                height={90}
                                style={[styles.profileImage]}
                            />
                        )}
                        {currentImageURL !== "" && (
                            <Image
                                source={{
                                    uri: currentImageURL,
                                }}
                                style={[styles.profileImage]}
                            />
                        )}
                    </TouchableOpacity>
                    {/** image upload modal */}
                    {!isLoading && (
                        <ImageUploadModal
                            isVisible={isImageUploadModalVisible}
                            onClose={() => setIsImageUploadModalVisible(false)}
                            title={"프로필 사진"}
                            descriptions={[
                                "프로필 사진으로 신뢰도를 높여보세요.",
                                "신뢰할 수 있는 이미지는 더 넓은 네트워크를 만듭니다.",
                            ]}
                            onRemoveImage={removeImage}
                            onUploadImage={uploadImage}
                            setIsLoading={setIsLoading}
                        />
                    )}
                    <View style={[styles.nameContainer]}>
                        <Text style={[styles.name]}>{userInfo?.name}</Text>
                        {isMyProfile && (
                            <TouchableOpacity
                                style={[styles.editButton]}
                                onPress={() => {
                                    router.push("/myprofile-edit");
                                }}
                            >
                                <Image
                                    source={require("@/assets/edit-icon.png")}
                                    style={[styles.editButtonIcon]}
                                />
                            </TouchableOpacity>
                        )}
                        {!isMyProfile && (
                            <Text>{`・ ${userInfo?.chonDegree}촌`}</Text>
                        )}
                    </View>
                    <View style={[styles.schoolContainer]}>
                        <Text style={[styles.schoolInfo]}>
                            {userInfo?.school}
                        </Text>
                        <Text style={[styles.sepLine]}>{"|"}</Text>
                        <Text style={[styles.schoolInfo]}>
                            {userInfo?.degree}
                        </Text>
                        <Text style={[styles.sepLine]}>{"|"}</Text>
                        <Text style={[styles.schoolInfo]}>
                            {`${userInfo?.admissionYear} 학번`}
                        </Text>
                    </View>
                    <View style={[styles.schoolContainer]}>
                        <Text style={[styles.schoolInfo]}>
                            {userInfo?.departments?.[0] ?? ""}
                        </Text>
                        {userInfo?.departments?.[1] && (
                            <>
                                <Text style={[styles.sepDot]}>{"·"}</Text>
                                <Text style={[styles.schoolInfo]}>
                                    {userInfo?.departments?.[1]}
                                </Text>
                            </>
                        )}
                    </View>
                    {/*** bottom view */}
                    <View style={[styles.bottomContainer]}>
                        <TouchableOpacity
                            style={[styles.bottomButton, styles.withMR17]}
                        >
                            <ChonIcon style={[styles.bottomButtonIcon]} />
                            <Text style={[styles.bottomButtonText]}>
                                {`1촌 ${userInfo?.chonCount}명`}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.bottomButton]}>
                            <PadoIcon style={[styles.bottomButtonIcon]} />
                            <Text style={[styles.bottomButtonText]}>
                                {"파도타기"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/** requesting 1-chon & sending message */}
                    {!isMyProfile && (
                        <View style={styles.requestAndMessageContainer}>
                            {!userInfo?.isChon && (
                                <SmallButton
                                    text={"1촌 신청"}
                                    onClickCallback={async () => {
                                        //TODO
                                    }}
                                    isLoading={false}
                                />
                            )}
                            <SmallButton
                                text={"메시지"}
                                onClickCallback={async () => {
                                    //TODO
                                }}
                                isLoading={false}
                                type={"secondary"}
                            />
                        </View>
                    )}
                    {/** bridge view */}
                    {!isMyProfile && !userInfo?.isChon && (
                        <View style={styles.bridgeContainer}>
                            <Text style={styles.bridgeTitle}>
                                {"나와의 관계"}
                            </Text>
                            <RelationShipBridgeView
                                startName={MyProfileDummyData.name}
                                endName={userInfo?.name}
                                relationShipList={extractBridgeNames(
                                    userInfo?.chonInfoFromMe
                                )}
                                distance={userInfo?.chonDegree}
                                isLoading={false}
                            />
                        </View>
                    )}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    myProfilecontainer: {
        flexDirection: "column",
        paddingTop: 80,
    },
    otherProfilecontainer: {
        flexDirection: "column",
        paddingTop: 0,
    },
    backbuttonContainer: {
        paddingVertical: 16,
        paddingHorizontal: 22,
        paddingBottom: 46,
    },
    headerContainer: {
        backgroundColor: theme.colors.white,
        paddingTop: 15,
        paddingBottom: 30,
        marginTop: 17,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
    },
    profileImageContainer: {
        position: "absolute",
        top: -45,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderColor: theme.colors.white,
        borderWidth: 4,
    },
    nameContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 40,
        gap: 4,
    },
    name: {
        fontSize: theme.fontSizes.smallTitle,
        fontWeight: 600,
        color: theme.colors.black,
    },
    editButton: {
        width: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    editButtonIcon: {
        width: 20,
        height: 20,
    },
    chon: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
    },
    schoolContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    schoolInfo: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        marginHorizontal: 3,
    },
    sepLine: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        paddingBottom: 3,
        marginHorizontal: 3,
    },
    sepDot: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        marginHorizontal: 3,
    },
    bottomContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 7,
    },
    bottomButton: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    withMR17: {
        marginRight: 17,
    },
    bottomButtonIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    bottomButtonText: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.main,
        fontWeight: 500,
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    requestAndMessageContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    bridgeContainer: {
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    bridgeTitle: {
        fontSize: theme.fontSizes.subtitle,
        color: theme.colors.black,
        fontWeight: 600,
        marginBottom: 12,
    },
});

export default NewProfileHeader;
