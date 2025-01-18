import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "@/components/search/SearchHeader";
import Tabs from "@/components/search/Tabs";
import FilterTabs from "@/components/search/FilterTabs";
import UserCard from "@/components/search/UserCard";
import SurfingIcon from "@/assets/search/SurfingIcon.svg";
import searchUser from "@/libs/apis/searchUser";

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
    const [activeFilter, setActiveFilter] = useState<string | null>(null); // 필터 상태

    const filteredResults = React.useMemo(() => {
        if (activeFilter === null) {
            return searchData; // 필터가 없으면 전체 데이터 반환
        }
        return searchData.filter((item) => {
            return item.relation_degree?.toString() === activeFilter;
        });
    }, [searchData, activeFilter]);

    // API 호출 함수
    const fetchSearchResults = async (query: string) => {
        try {
            // 실제 API 요청 구현
            // const data: SearchData = {
            //     results: [
            //         {
            //             user: {
            //                 id: 5,
            //                 email: "testuser05@kaist.ac.kr",
            //                 profile: {
            //                     user_name: "유저5",
            //                     relation_degree: "2",
            //                     school: "KAIST",
            //                     current_academic_degree: "학사",
            //                     year: 2024,
            //                     major1: "전산학부",
            //                     major2: null,
            //                     image: null,
            //                     keywords: ["Drum", "Bass", "Guitar"],
            //                 },
            //                 user_name: "유저5",
            //             },
            //             new_user: false,
            //         },
            //         {
            //             user: {
            //                 id: 3,
            //                 email: "testuser03@kaist.ac.kr",
            //                 profile: {
            //                     user_name: "유저3",
            //                     relation_degree: "1",
            //                     school: "카이스트",
            //                     current_academic_degree: "석사",
            //                     year: 2024,
            //                     major1: "전산학부",
            //                     major2: "물리학과",
            //                     image: null,
            //                     keywords: ["singing", "dancing", "acting"],
            //                 },
            //                 user_name: "유저3",
            //             },
            //             new_user: true,
            //         },
            //     ],
            // };
            const response = await searchUser({
                q: searchQuery,
                degree: [],
            });
            setSearchData(response.results); // API 호출 결과를 상태로 업데이트
            setSearchHistory((prev) => [...prev, query]); // 검색 히스토리 추가
        } catch (error) {
            console.error("검색 API 호출 실패:", error);
        }
    };

    // 컴포넌트가 마운트될 때 초기 검색 실행
    useEffect(() => {
        fetchSearchResults(""); // 빈 문자열로 초기 검색 실행
    }, []);

    // 뒤로가기 함수
    const handleGoBack = () => {
        setSearchHistory((prev) => {
            if (prev.length > 1) {
                const updatedHistory = [...prev];
                updatedHistory.pop(); // 가장 최근 검색어 제거
                const lastQuery = updatedHistory[updatedHistory.length - 1]; // 이전 검색어
                setSearchQuery(lastQuery); // 검색어 복원
                fetchSearchResults(lastQuery); // 검색 결과 복원
                return updatedHistory;
            } else {
                setSearchQuery(""); // 검색어 초기화
                fetchSearchResults(""); // 초기 데이터로 복원
                return [];
            }
        });
    };

    const handleFloatingButtonPress = () => {
        console.log("플로팅 버튼 클릭됨");
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["top"]}
        >
            {/* 상단 헤더 */}
            <SearchHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={fetchSearchResults}
                onGoBack={handleGoBack}
            />

            {/* 탭 메뉴 */}
            <Tabs
                tabs={["사람", "프로젝트 + 게시물"]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* 탭 내용 */}
            <View style={styles.contentContainer}>
                {activeTab === "사람" && (
                    <View>
                        {/* 필터 */}
                        <FilterTabs
                            activeFilter={activeFilter}
                            handleFilterChange={setActiveFilter}
                        />

                        {/* 결과 개수 */}
                        <Text style={styles.resultCount}>
                            {filteredResults.length}명
                        </Text>

                        {/* 검색 결과 리스트 */}
                        <FlatList
                            data={filteredResults}
                            keyExtractor={(item) => String(item.user.id)}
                            renderItem={({ item }) => <UserCard {...item} />}
                        />
                    </View>
                )}
                {activeTab === "프로젝트 + 게시물" && (
                    <Text>프로젝트 검색 결과</Text>
                )}
            </View>
            {/* 플로팅 버튼 */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={handleFloatingButtonPress}
            >
                <SurfingIcon />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        borderTopWidth: 6,
        borderColor: "#D9D9D9",
        padding: 16,
        marginBottom: 54,
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
    floatingButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});
