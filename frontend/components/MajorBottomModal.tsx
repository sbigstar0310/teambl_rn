import React, { useState, useRef } from "react";
import {
    StyleSheet,
    View,
    ViewStyle,
    TouchableOpacity,
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
    height: 130px;
    margin-vertical: 16px;
`;

const MajorBottomModal: React.FC<Props> = ({
    handleMajorSelect,
    visible,
    onClose,
    selectedMajors,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const majors = KAIST_DEPARTMENTS;
    const textInputRef = useRef<TextInput | null>(null);

    const body = (
        <View style={{ flex: 1, gap: 12, }}>
            {/* Title and Description */}
            <Title>전공</Title>

            {/* 검색창 */}
            <TouchableOpacity onPress={() => textInputRef.current?.focus()}>
                <MajorSearchInput>
                    <SearchIcon width={15} height={15} />
                    <TextInput
                        ref={textInputRef}
                        placeholder={"전공을 검색해주세요"}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </MajorSearchInput>
            </TouchableOpacity>

            {/* 검색 결과 */}
            <View style={{ flex: 1 }}>
                <MajorSearchResult>
                    {
                        selectedMajors&&
                        selectedMajors.map((major) => {
                            return (
                                <MajorItem
                                    key={major}
                                    major={major}
                                    onPress={() => {
                                        handleMajorSelect(major);
                                    }}
                                    isSelected={true}
                                />
                            );
                        })
                    }
                    {
                        majors
                        .filter((major) => major.includes(searchQuery))
                        .slice(0, 4)
                        .map((major) => {
                            if (!selectedMajors.includes(major)) {
                                return (
                                    <MajorItem
                                        key={major}
                                        major={major}
                                        onPress={() => {
                                            handleMajorSelect(major);
                                        }}
                                        isSelected={false}
                                    />
                                );
                            }                        
                        })
                    }
                </MajorSearchResult>
            </View>

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
            heightPercentage={0.8}
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