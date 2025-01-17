import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";
import { useNavigation } from "@react-navigation/native";

type SearchHeaderProps = {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    onSearch: (query: string) => void;
};

export default function SearchHeader({
    searchQuery,
    setSearchQuery,
    onSearch,
}: SearchHeaderProps) {
    const navigation = useNavigation();
    return (
        <View style={styles.headerContainer}>
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <LeftArrowIcon width={20} height={16} />
            </TouchableOpacity>

            {/* 검색 입력 필드 */}
            <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)} // 입력된 값만 업데이트
                onSubmitEditing={() => onSearch(searchQuery)} // 입력 완료 시 검색 실행
                placeholder="찾으시는 사람 또는 프로젝트가 있나요?"
                placeholderTextColor="#A8A8A8"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 19,
    },
});
