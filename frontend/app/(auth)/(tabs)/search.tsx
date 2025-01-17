import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "@/components/search/SearchHeader";
import Tabs from "@/components/search/Tabs";
import FilterTabs from "@/components/search/FilterTabs";
import UserCard from "@/components/search/UserCard";

// 하드코딩된 데이터
const mockData = {
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
    const [activeTab, setActiveTab] = useState<"사람" | "프로젝트 + 게시물">("사람");
    const tabs: Array<"사람" | "프로젝트 + 게시물"> = ["사람", "프로젝트 + 게시물"];
    const [activeFilter, setActiveFilter] = useState<string | null>(null); // 필터 상태
    const [filteredResults, setFilteredResults] = useState(mockData.results); // 필터링된 결과

    // 필터 변경 핸들러
    const handleFilterChange = (filter: string | null) => {
        setActiveFilter(filter);
        if (filter === null) {
            setFilteredResults(mockData.results); // 필터 해제 시 전체 데이터 표시
        } else {
            const filtered = mockData.results.filter(
                (item) => item.user.profile.relation_degree === filter
            );
            setFilteredResults(filtered);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
            {/* 상단 헤더 */}
            <SearchHeader />

            {/* 탭 메뉴 */}
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* 탭 내용 */}
            <View style={styles.contentContainer}>
                {activeTab === "사람" && (
                    <View>
                        {/* 필터 */}
                        <FilterTabs
                            activeFilter={activeFilter}
                            handleFilterChange={handleFilterChange}
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
