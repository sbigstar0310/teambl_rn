import React, { useState, useEffect, act } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";
import SearchIcon from "@/assets/padotaki/SearchIcon.svg";
import DefaultProfile from "@/assets/DefaultProfile.svg";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import PostCard from "@/components/cards/PostCard";
import { mockPost1, mockPost2, mockUser1 } from "@/shared/mock-data";
import fetchOneDegreeProjectCard from "@/libs/apis/ProjectCard/fetchOneDegreeProjectCard";
import { USER_ID } from "@/shared/constants";
import fetchFriendList from "@/libs/apis/Friend/fetchFriendList";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import ProjectCard from "@/components/cards/ProjectCard";

const mockPosts = [mockPost1, mockPost2];
const mockUsers = [mockUser1, mockUser1];

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
                <DefaultProfile width={40} height={40} />
            )}
        </View>
        <View style={styles.contentText}>
            <Text style={styles.userName}>{item.profile.user_name}</Text>
            <Text style={styles.josa}>님</Text>
            <Text style={styles.see}>{} 1촌의 프로젝트 보기</Text>
        </View>
    </TouchableOpacity>
);

type Params = {
    current_target_user_id: string;
};

const PadoTakiScreen = () => {
    const searchParams = useSearchParams();
    const userName = searchParams.get("userName")
        ? `${searchParams.get("userName")}님`
        : "내";
    const initialTab = searchParams.get("activeTab") || "projects";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [projectCardList, setProjectCardList] = useState<api.ProjectCard[]>(
        []
    );
    const [userList, setUserList] = useState<api.User[]>([]);
    const { current_target_user_id } = useLocalSearchParams<Params>();

    useEffect(() => {
        fetchPadoTaki();
    }, []);

    const fetchPadoTaki = async () => {
        try {
            console.log("current_taret_user_id", current_target_user_id);
            // fetch project card list
            const projectCardList = await fetchOneDegreeProjectCard(
                Number(current_target_user_id)
            );
            setProjectCardList(projectCardList);

            // fetch user(friend) list
            const friendList = await fetchFriendList(
                Number(current_target_user_id)
            );
            setUserList(friendList);
        } catch (error) {
            console.error("Failed to fetch pado taki:", error);
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

                <View style={styles.content}>
                    {activeTab === "projects" ? (
                        projectCardList.map((projectCard) =>
                            projectCard.posts.length > 0 ? (
                                // Render posts if available
                                <FlatList
                                    key={projectCard.id} // Ensure each FlatList has a unique key
                                    contentContainerStyle={{
                                        gap: 20,
                                        padding: 2,
                                    }}
                                    data={projectCard.posts}
                                    renderItem={({ item }) => (
                                        <PostCard post={item} />
                                    )}
                                />
                            ) : (
                                // Render ProjectCard if no posts are present
                                <ProjectCard
                                    key={projectCard.id}
                                    projectCard={projectCard}
                                />
                            )
                        )
                    ) : (
                        <>
                            {/* 결과 개수 */}
                            <Text style={styles.resultCount}>
                                {userList.length}명
                            </Text>
                            <FlatList
                                data={userList}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => <UserRow item={item} />}
                            />
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        justifyContent: "space-between",
        paddingHorizontal: 16,
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
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: 600,
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
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: 600,
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
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    resultCount: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 17,
        color: "#595959",
    },
    imageContainer: {
        marginRight: 12,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    contentText: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "600",
        fontSize: 16,
        lineHeight: 21,
        color: "#121212",
    },
    josa: {
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        fontSize: 16,
        lineHeight: 21,
        color: "#121212",
    },
    see: {
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        fontSize: 16,
        lineHeight: 21,
        color: "#2546F3",
    },
});

export default PadoTakiScreen;
