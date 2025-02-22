import React, { useState, useEffect, act } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";
import SearchIcon from "@/assets/padotaki/SearchIcon.svg";
import DefaultProfile from "@/assets/DefaultProfile.svg";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import PostCard from "@/components/cards/PostCard";
import fetchOneDegreeProjectCard from "@/libs/apis/ProjectCard/fetchOneDegreeProjectCard";
import ProjectCard from "@/components/cards/ProjectCard";
import fetchOneDegreeFriends from "@/libs/apis/Friend/fetchOneDegreeFriends";
import NoSearchResult from "@/components/common/NoSearchResult";
import { useAuthStore } from "@/store/authStore";
import ProjectPreview from "@/components/ProjectPreview";
import fetchMyProjectCard from "@/libs/apis/ProjectCard/fetchMyProjectCard";
import theme from "@/shared/styles/theme";

type HeaderProps = {
    onBackPress: () => void;
    onSearchPress: () => void;
};

const Header: React.FC<HeaderProps> = ({ onBackPress, onSearchPress }) => (
    <View style={styles.header}>
        <View style={styles.titleContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                <LeftArrowIcon width={20} height={16} />
            </TouchableOpacity>
            <Text style={styles.title}>파도타기</Text>
        </View>
        <TouchableOpacity onPress={onSearchPress}>
            <SearchIcon width={20} height={20} />
        </TouchableOpacity>
    </View>
);

type TabsProps = {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    userName: string;
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, userName }) => (
    <View style={styles.tabs}>
        <TouchableOpacity
            style={[styles.tab, activeTab === "projects" && styles.activeTab]}
            onPress={() => setActiveTab("projects")}
        >
            <Text
                style={[
                    styles.tabText,
                    activeTab === "projects" && styles.activeTabText,
                ]}
            >
                {userName} 1촌의 프로젝트
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[
                styles.tab,
                activeTab === "connections" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("connections")}
        >
            <Text
                style={[
                    styles.tabText,
                    activeTab === "connections" && styles.activeTabText,
                ]}
            >
                이어지는 프로젝트
            </Text>
        </TouchableOpacity>
    </View>
);

type UserRowProps = {
    item: api.User;
};

const UserRow: React.FC<UserRowProps> = ({ item }) => (
    <TouchableOpacity
        style={styles.userRow}
        onPress={() => {
            router.push({
                pathname: `/padotaki`,
                params: {
                    current_target_user_id: item.id.toString(),
                    userName: item.profile.user_name,
                    activeTab: "projects",
                },
            });
        }}
    >
        <View style={styles.imageContainer}>
            {item.profile.image ? (
                <Image
                    source={{ uri: item.profile.image }}
                    style={styles.profileImage}
                />
            ) : (
                <DefaultProfile width={52} height={52} />
            )}
        </View>
        <View style={styles.contentText}>
            <Text style={styles.userName}>{item.profile.user_name}</Text>
            <Text style={styles.josa}>님</Text>
            <Text style={styles.see}>{ } 1촌의 프로젝트 보기</Text>
        </View>
    </TouchableOpacity>
);

type Params = {
    current_target_user_id: string;
};

const PadoTakiScreen = () => {
    const searchParams = useSearchParams();
    const [userName, setUserName] = useState("내");
    const initialTab = searchParams.get("activeTab") || "projects";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [projectCardList, setProjectCardList] = useState<api.ProjectCard[]>(
        []
    );
    const [userList, setUserList] = useState<api.User[]>([]);
    const [loading, setLoading] = useState(false);
    const { current_target_user_id } = useLocalSearchParams<Params>();
    const current_user_id = useAuthStore.getState().user?.id;

    useEffect(() => {
        fetchPadoTaki();
        if (current_target_user_id !== current_user_id?.toString()) {
            setUserName(`${searchParams.get("userName")}님`);
        }
    }, []);

    const ProjectListView = () => {
        let items: React.JSX.Element[] = [];
        projectCardList.map((projectCard) =>
            items.push(
                <View
                    key={projectCard.id}
                    style={{
                        width: "100%",
                        backgroundColor: theme.colors.white,
                        paddingVertical: 16,
                    }}
                >
                    <ProjectPreview
                        projectInfo={projectCard}
                        myId={current_user_id ? current_user_id : -99}
                    />
                </View>
            )
        );

        return (
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: theme.colors.background3,
                }}
            >
                {items}
            </ScrollView>
        );
    };

    const fetchPadoTaki = async () => {
        setLoading(true); // 로딩 시작
        try {
            const current_target_user_id_number = Number(
                current_target_user_id
            );
            console.log("current_taret_user_id", current_target_user_id_number);
            // fetch project card list
            const projectCardList = await fetchOneDegreeProjectCard(
                current_target_user_id_number
            );

            // For debugging
            // const projectCardList = await fetchMyProjectCard();
            setProjectCardList(projectCardList);

            // fetch user(friend) list
            const oneDegreefriendList = await fetchOneDegreeFriends(
                current_target_user_id_number
            );
            setUserList(oneDegreefriendList);
        } catch (error) {
            console.error("Failed to fetch pado taki:", error);
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.container}>
                <Header
                    onBackPress={() => router.back()}
                    onSearchPress={() => router.push("/search")}
                />
                <Tabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    userName={userName}
                />

                <View style={[styles.content, (
                    (activeTab === "projects") &&
                    (projectCardList.length > 0) &&
                    {
                        paddingHorizontal: 0,
                        paddingVertical: 0,
                        backgroundColor: theme.colors.background3,
                    }
                )]}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#0923A9" />
                        </View>
                    ) : activeTab === "projects" ? (
                        projectCardList.length <= 0 ? (
                            <NoSearchResult
                                title="검색된 프로젝트가 없습니다."
                                message="이어지는 프로젝트 탭에서 더 많은 프로젝트를 확인해보세요."
                            />
                        ) : <ProjectListView />
                    ) : (
                        <>
                            <Text style={styles.resultCount}>
                                {userList.length}명
                            </Text>
                            {userList.length === 0 ? (
                                <NoSearchResult
                                    title="이어지는 프로젝트가 없습니다."
                                    message="우측 상단의 탐색 버튼을 눌러 탐색 화면으로 이동하세요."
                                />
                            ) : (
                                <FlatList
                                    data={userList}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <UserRow item={item} />
                                    )}
                                />
                            )}
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        justifyContent: "space-between",
        height: 56,
        backgroundColor: "#fff",
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 20,
    },
    title: {
        fontFamily: "PretendardSemiBold",
        fontStyle: "normal",
        fontSize: 20,
        lineHeight: 25,
        color: "#121212",
    },
    tabs: {
        flexDirection: "row",
        justifyContent: "center",
        height: 42,
        backgroundColor: "#fff",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTab: {
        borderBottomWidth: 1.5,
        borderColor: "#0923A9",
    },
    tabText: {
        fontFamily: "PretendardSemibold",
        fontStyle: "normal",
        fontSize: 16,
        lineHeight: 21,
        color: "#595959",
    },
    activeTabText: {
        color: "#0923A9",
    },
    content: {
        flex: 1,
        padding: 16,
        borderTopWidth: 4,
        borderColor: "#F5F5F5",
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    resultCount: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        lineHeight: 17,
        color: "#595959",
    },
    imageContainer: {
        marginRight: 12,
    },
    profileImage: {
        width: 52,
        height: 52,
        borderRadius: 25,
    },
    contentText: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        fontFamily: "PretendardSemibold",
        fontStyle: "normal",
        fontSize: 16,
        lineHeight: 20,
        color: "#121212",
    },
    josa: {
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        fontSize: 16,
        lineHeight: 20,
        color: "#121212",
    },
    see: {
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        fontSize: 16,
        lineHeight: 20,
        color: "#2546F3",
    },
});

export default PadoTakiScreen;
