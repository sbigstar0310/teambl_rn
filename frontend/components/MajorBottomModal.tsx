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
  font-weight: 500;
  letter-spacing: -0.38px;
  margin-right: 16px;
`;

const Description = styled.Text`
  font-family: "pretendard";
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.38px;
`;

const DegreeText = styled.Text`
  margin-left: 8px;
  font-size: 14px;
`;

const MajorBottomModal: React.FC<Props> = ({
  handleMajorSelect,
  visible,
  onClose,
  selectedMajors,
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const majors = ["전산학부", "전자공학과", "수리과학부", "산업및시스템공학과"];

  const body = (
    <View>
      {/* Title and Description */}
      <View style={{ marginBottom: 12 }}>
        <Title>전공</Title>
      </View>

      {/* 검색창 */}
      <View style={styles.optionContainer}>
        <TouchableOpacity>
          <SearchIcon />
        </TouchableOpacity>
        <TextInput
          placeholder={"전공을 검색해주세요"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 검색 결과 */}
      <View
        style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", height: 80 }}
      >
        {majors
          .filter((major) => major.includes(searchQuery))
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
      </View>

      {/* 선택 완료 버튼 */}
      <PrimeButton
        text={"선택 완료"}
        onClickCallback={async () => {
          onClose();
        }}
        isActive={
          selectedMajors.filter((major) => major !== "" && major !== undefined)
            .length > 0
        }
        isLoading={false}
      />
    </View>
  );

  return <BottomModal visible={visible} onClose={onClose} body={body} />;
};

const styles = StyleSheet.create({
  hStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  marginBottom32: {
    marginBottom: 32,
  },
  vStack: {
    flexDirection: "column",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#F5F5F5",
    padding: 10,
    gap: 5,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  optionalSemiTitle: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default MajorBottomModal;
