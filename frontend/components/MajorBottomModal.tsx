import React, { useState } from "react";
import {
    StyleSheet,
    View,
    ViewStyle,
    TouchableOpacity,
    Text,
    TextInput,
} from "react-native";
import BottomModal from "./BottomModal";
import styled from "@emotion/native";
import PrimeButton from "./PrimeButton";
import SearchIcon from "@/assets/search-icon.svg";
import MajorItem from "./MajorItem";
import { KAIST_DEPARTMENTS } from "@/shared/constants";

type Props = {
    visible: boolean;
    onClose: () => void;
    heightPercentage?: number;
    style?: ViewStyle;
    handleMajorSelect: (major1: string, major2?: string) => void;
    selectedMajors: string[];
};

// Styled components

const Title = styled.Text`
    font-family: "pretendard";
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.38px;
    margin-right: 16px;
`;

const MajorSearchInput = styled.View`
    flex-direction: row;
    align-items: center;
    height: 40px;
    background-color: #f5f5f5;
    border-radius: 5px;
    padding-horizontal: 12px;
    gap: 12px;
`;

const MajorSearchResult = styled.View`
    flex-direction: row;
    gap: 8px;
    flex-wrap: wrap;
    height: 80px;
    margin-vertical: 16px;
`;

const MajorBottomModal: React.FC<Props> = ({
    handleMajorSelect,
    visible,
    onClose,
    selectedMajors,
    heightPercentage,
    style,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const majors = KAIST_DEPARTMENTS;

    const body = (
        <View style={[style]}>
            {/* Title and Description */}
            <View style={{ marginBottom: 12 }}>
                <Title>전공</Title>
            </View>

            {/* 검색창 */}
            <MajorSearchInput>
                <SearchIcon width={15} height={15} />
                <TextInput
                    placeholder={"전공을 검색해주세요"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </MajorSearchInput>

            {/* 검색 결과 */}
            <MajorSearchResult>
                {majors
                    .filter((major) => major.includes(searchQuery))
                    .slice(0, 4)
                    .map((major) => (
                        <MajorItem
                            key={major}
                            major={major}
                            onPress={() => {
                                handleMajorSelect(major);
                            }}
                            isSelected={selectedMajors.includes(major)}
                        />
                    ))}
            </MajorSearchResult>

            {/* 선택 완료 버튼 */}
            <PrimeButton
                text={"선택 완료"}
                onClickCallback={async () => {
                    onClose();
                }}
                isActive={
                    selectedMajors.filter(
                        (major) => major !== "" && major !== undefined
                    ).length > 0
                }
                isLoading={false}
            />
        </View>
    );

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            body={body}
            heightPercentage={heightPercentage}
        />
    );
};

const styles = StyleSheet.create({
    optionContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        backgroundColor: "#F5F5F5",
        padding: 10,
        gap: 5,
    },
});

export default MajorBottomModal;
