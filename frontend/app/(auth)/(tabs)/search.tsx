import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "@/components/search/SearchHeader";
import Tabs from "@/components/search/Tabs";
import FilterTabs from "@/components/search/FilterTabs";
import UserCard from "@/components/search/UserCard";

// 초기 데이터
const initialData = {
    results: [
        {
            user: {
                id: 3,
                email: "testuser03@kaist.ac.kr",
                profile: {
                    user_name: "유저3",
                    relation_degree: "1",
                    school: "카이스트",
                    current_academic_degree: "석사",
                    year: 2024,
                    major1: "전산학부",
                    major2: "물리학과",
                    image: null,
                    keywords: ["singing", "dancing", "acting"],
                },
                user_name: "유저3",
            },
            new_user: true,
        },
        {
            user: {
                id: 5,
                email: "testuser05@kaist.ac.kr",
                profile: {
                    user_name: "유저5",
                    relation_degree: "2",
                    school: "KAIST",
                    current_academic_degree: "학사",
                    year: 2024,
                    major1: "전산학부",
                    major2: null,
                    image: null,
                    keywords: ["Drum", "Bass", "Guitar"],
                },
                user_name: "유저5",
            },
            new_user: false,
        },
    ],
};

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [mockData, setMockData] = useState(initialData);
    const [activeTab, setActiveTab] = useState<"사람" | "프로젝트 + 게시물">("사람");
    const tabs: Array<"사람" | "프로젝트 + 게시물"> = ["사람", "프로젝트 + 게시물"];
    const [activeFilter, setActiveFilter] = useState<string | null>(null); // 필터 상태 // 필터링된 데이터를 계산
    
    const filteredResults = React.useMemo(() => {
        if (activeFilter === null) {
            return mockData.results; // 필터가 없으면 전체 데이터 반환
        }
        return mockData.results.filter(
            (item) => item.user.profile.relation_degree === activeFilter
        );
    }, [mockData, activeFilter]); // mockData나 activeFilter가 변경되면 재계산


    // API 호출 함수 (예시)
    const fetchSearchResults = async (query: string) => {
        try {
            // 실제 API 요청을 여기에 작성
            const data = {
                results: [
                    {
                        user: {
                            id: 5,
                            email: "testuser05@kaist.ac.kr",
                            profile: {
                                user_name: "유저5",
                                relation_degree: "2",
                                school: "KAIST",
                                current_academic_degree: "학사",
                                year: 2024,
                                major1: "전산학부",
                                major2: null,
                                image: null,
                                keywords: ["Drum", "Bass", "Guitar"],
                            },
                            user_name: "유저5",
                        },
                        new_user: false,
                    },
                    {
                        user: {
                            id: 3,
                            email: "testuser03@kaist.ac.kr",
                            profile: {
                                user_name: "유저3",
                                relation_degree: "1",
                                school: "카이스트",
                                current_academic_degree: "석사",
                                year: 2024,
                                major1: "전산학부",
                                major2: "물리학과",
                                image: null,
                                keywords: ["singing", "dancing", "acting"],
                            },
                            user_name: "유저3",
                        },
                        new_user: true,
                    },
                ],
            };

            // API 호출 결과를 상태로 업데이트
            setMockData(data);
        } catch (error) {
            console.error("검색 API 호출 실패:", error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
            {/* 상단 헤더 */}
            <SearchHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={fetchSearchResults}
            />

            {/* 탭 메뉴 */}
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

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
                            renderItem={({ item }) => <UserCard user={item.user} />}
                        />
                    </View>
                )}
                {activeTab === "프로젝트 + 게시물" && <Text>프로젝트 검색 결과</Text>}
            </View>
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
});
