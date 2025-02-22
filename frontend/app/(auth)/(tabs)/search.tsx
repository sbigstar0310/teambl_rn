import React, {useEffect, useState} from "react";
import {FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import SearchHeader from "@/components/search/SearchHeader";
import Tabs from "@/components/search/Tabs";
import UserFilterTabs from "@/components/search/UserFilterTabs";
import UserCard from "@/components/search/UserCard";
import SurfingIcon from "@/assets/search/SurfingIcon.svg";
import searchUser from "@/libs/apis/Search/searchUser";
import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {USER_ID} from "@/shared/constants";
import NoSearchResult from "@/components/common/NoSearchResult";
import ProjFilterTabs from "@/components/search/ProjFilterTabs";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import {mockPost1, mockPost2} from "@/shared/mock-data";
import ProjectPreview from "@/components/ProjectPreview";
import {useAuthStore} from "@/store/authStore";
import theme from "@/shared/styles/theme";
import PostInProjectPreview from "@/components/PostInProjectPreview";
import searchProjectCard from "@/libs/apis/Search/searchProjectCard";
import searchPost from "@/libs/apis/Search/searchPost";

const mockPosts = [mockPost1, mockPost2];

// 데이터 타입 정의
interface SearchData {
    results: SearchResult[];
}

interface SearchResult {
    user: User;
    new_user: boolean;
}

interface User {
    id: number;
    email: string;
    profile: UserProfile;
    user_name: string;
}

interface UserProfile {
    user_name: string;
    relation_degree: string;
    school: string;
    current_academic_degree: string;
    year: number;
    major1: string;
    major2: string | null;
    image: string | null;
    keywords: string[];
}

type UserSearchData = {
    is_new_user: boolean;
    relation_degree: number | null;
    user: api.User;
};

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchData, setSearchData] = useState<UserSearchData[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]); // 검색 히스토리
    const [activeTab, setActiveTab] = useState<"사람" | "프로젝트 + 게시물">(
        "사람"
    );
    const [activeUserFilter, setActiveUserFilter] = useState<string | null>(
        null
    );
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [activeProjFilter, setActiveProjFilter] = useState<string | null>(
        null
    );

    const [resultProject, setResultProject] = useState<
        api.ProjectCard[] | null
    >(null);
    const [resultPosts, setResultPosts] = useState<api.Post[] | null>(null);

    const myId = useAuthStore.getState().user?.id || -99;

    if (myId === -99) {
        return (
            <View>
                <Text>{"사용자 정보 수신에 실패했습니다."}</Text>
            </View>
        );
    }

    const filteredResults = React.useMemo(() => {
        if (activeUserFilter === null) {
            return searchData;
        }
        return searchData.filter((item) => {
            return item.relation_degree?.toString() === activeUserFilter;
        });
    }, [searchData, activeUserFilter]);

    // 컴포넌트가 마운트될 때 초기 검색 실행
    useEffect(() => {
        fetchSearchResults(""); // 빈 문자열로 초기 검색 실행
    }, []);

    // API 호출 함수
    const fetchSearchResults = async (query: string) => {
        setLoading(true); // 로딩 시작
        try {
            const response = await searchUser({q: query, degree: []});
            setSearchData(response.results);
            const searchedProjectCards = await searchProjectCard({q: query});
            setResultProject(searchedProjectCards.results);
            const searchedPosts = await searchPost({q: query});
            setResultPosts(searchedPosts.results);
        } catch (error) {
            console.error("검색 API 호출 실패:", error);
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    // 뒤로가기 함수
    const handleGoBack = () => {
        // searchHistory 배열에서 마지막 검색어를 제거하고, 이전 검색어를 복원
        const previousHistory = [...searchHistory];
        previousHistory.pop(); // 마지막 검색어 제거
        setSearchHistory(previousHistory); // 검색 기록 업데이트

        const previousQuery = previousHistory[previousHistory.length - 1] || "";
        setSearchQuery(previousQuery); // 이전 검색어로 검색창 업데이트

        // 이전 검색어로 결과를 다시 호출
        fetchSearchResults(previousQuery);
    };

    // 새로운 검색어로 검색하는 함수
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        fetchSearchResults(query);

        // 검색 기록에 새로운 검색어 추가
        setSearchHistory((prevHistory) => [...prevHistory, query]);
    };

    const ProjPostListView = () => {
        return (
            <ScrollView contentContainerStyle={[
                styles.projectContainer,
                (!resultProject || resultProject.length === 0) && {
                    backgroundColor: theme.colors.white,
                    padding: 16,
                },
            ]}>
                {!resultProject ||
                    (resultProject.length === 0 && (
                        <NoSearchResult
                            title="검색 결과가 없습니다."
                            message="필터를 조정하거나 새로운 검색어를 입력해보세요."
                        />
                    ))}
                {resultProject &&
                    resultProject.length > 0 &&
                    resultProject.map((project: api.ProjectCard, index: number) => {
                        return (
                            <View
                                key={index}
                                style={styles.projPostContainer}
                            >
                                {/** project preview call */}
                                <ProjectPreview
                                    projectInfo={project}
                                    myId={myId}
                                />
                                {/** post preview call */}
                                {
                                    project.posts.length > 0 &&
                                    <View
                                        style={styles.postViewContainer}
                                    >
                                        {
                                            project.posts.map((post: any, index: number) => {
                                                return (
                                                    <PostInProjectPreview
                                                        key={index}
                                                        postInfo={post}
                                                        myId={myId}
                                                        onPostDelete={() => fetchSearchResults(searchQuery)}
                                                    />
                                                );
                                            })
                                        }
                                    </View>
                                }
                            </View>
                        );
                    })
                }
            </ScrollView>
        );
    };

    const ProjectListView = () => {
        return (
            <ScrollView contentContainerStyle={[
                styles.projectContainer,
                (!resultProject || resultProject.length === 0) && {
                    backgroundColor: theme.colors.white,
                    padding: 16,
                },
            ]}>
                {!resultProject ||
                    (resultProject.length === 0 && (
                        <NoSearchResult
                            title="검색 결과가 없습니다."
                            message="필터를 조정하거나 새로운 검색어를 입력해보세요."
                        />
                    ))}
                {resultProject &&
                    resultProject.length > 0 &&
                    resultProject.map((project, index) => (
                        <View
                            key={project.id + " " + index}
                            style={{
                                width: "100%",
                                paddingVertical: 16,
                                backgroundColor: theme.colors.white,
                            }}
                        >
                            <ProjectPreview projectInfo={project} myId={myId}/>
                        </View>
                    ))}
            </ScrollView>
        );
    };

    const PostListView = () => {
        return (
            <ScrollView
                contentContainerStyle={[
                    styles.projectContainer,
                    {
                        backgroundColor: theme.colors.white,
                        padding: 16,
                    },
                ]}
            >
                {!resultPosts ||
                    (resultPosts.length === 0 && (
                        <NoSearchResult
                            title="검색 결과가 없습니다."
                            message="필터를 조정하거나 새로운 검색어를 입력해보세요."
                        />
                    ))}
                {resultPosts &&
                    resultPosts.length > 0 &&
                    resultPosts.map((post, index) => (
                        <View
                            key={post.id + index}
                            style={{
                                width: "100%",
                            }}
                        >
                            <PostInProjectPreview postInfo={post} myId={myId}
                                                  onPostDelete={() => fetchSearchResults(searchQuery)}/>
                        </View>
                    ))}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView
            style={{flex: 1, backgroundColor: "#fff"}}
            edges={["top"]}
        >
            {/* 로딩 모달 */}
            <LoadingOverlay isLoading={loading}/>

            {/* 상단 헤더 */}
            <SearchHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch} // 새로운 검색어가 입력되면 handleSearch 실행
                onGoBack={handleGoBack} // 뒤로가기 버튼 클릭 시 handleGoBack 실행
            />

            {/* 탭 메뉴 */}
            <Tabs
                tabs={["사람", "프로젝트 + 게시물"]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* 탭 내용 */}
            <View style={[styles.contentContainer]}>
                {activeTab === "사람" && (
                    <View style={{flex: 1, padding: 16, paddingBottom: 0}}>
                        {/* 필터 */}
                        <UserFilterTabs
                            activeFilter={activeUserFilter}
                            handleFilterChange={setActiveUserFilter}
                        />

                        {/* 결과 개수 */}
                        <Text style={styles.resultCount}>
                            {filteredResults.length}명
                        </Text>

                        {filteredResults.length === 0 ? (
                            <NoSearchResult
                                title="검색 결과가 없습니다."
                                message="필터를 조정하거나 새로운 검색어를 입력해보세요."
                            />
                        ) : (
                            <FlatList
                                data={filteredResults}
                                keyExtractor={(item) => String(item.user.id)}
                                renderItem={({item}) => (
                                    <UserCard {...item} />
                                )}
                            />
                        )}
                    </View>
                )}
                {activeTab === "프로젝트 + 게시물" && (
                    <View style={{flex: 1}}>
                        {/* 필터 */}
                        <View
                            style={{
                                paddingLeft: 16,
                                paddingTop: 16,
                            }}
                        >
                            <ProjFilterTabs
                                activeFilter={activeProjFilter}
                                handleFilterChange={setActiveProjFilter}
                            />
                        </View>
                        {activeProjFilter === null && (
                            <ProjPostListView/>
                        )}
                        {`${activeProjFilter}` === `${1}` && (
                            <ProjectListView/>
                        )}
                        {`${activeProjFilter}` === `${2}` && <PostListView/>}
                    </View>
                )}
            </View>

            {/* 플로팅 버튼 */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={async () => {
                    const userId = await AsyncStorage.getItem(USER_ID);
                    console.log("userId", userId);
                    router.push({
                        pathname: "/padotaki",
                        params: {
                            current_target_user_id: userId,
                        },
                    });
                }}
            >
                <SurfingIcon/>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        borderTopWidth: 4,
        borderColor: "#F5F5F5",
    },
    resultCount: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: "PretendardRegular",
        fontStyle: "normal",
        lineHeight: 17,
        color: "#595959",
    },
    floatingButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    projectContainer: {
        flexGrow: 1,
        gap: 8,
        backgroundColor: theme.colors.achromatic05,
    },
    projPostContainer: {
        gap: 10,
        backgroundColor: theme.colors.white,
        paddingVertical: 20
    },
    postViewContainer: {
        paddingHorizontal: 16,
        backgroundColor: theme.colors.white,
        gap: 15
    }
});
