import styled from "@emotion/native";
import MajorSelectedItem from "./MajorSelectedItem";
import SearchIcon from "@/assets/search-icon.svg";
import React from "react";

type Props = {
  selectedMajors: string[];
  placeholder: string;
  onPress: () => void;
  onRemove: (major: string) => void;
};

const Container = styled.Pressable`
  flex-direction: row;
  width: 100%;
  height: 40px;
  padding-horizontal: 12px;
  gap: 10px;
  background-color: #f5f5f5;
  align-items: center;
  border-radius: 5px;
`;

const Placeholder = styled.Text`
  color: #a8a8a8;
  font-family: "Pretendard";
  font-size: 16px;
`;

const MajorSearchInput: React.FC<Props> = ({
  selectedMajors,
  placeholder,
  onPress,
  onRemove,
}) => {
  return (
    <Container onPress={onPress}>
      <SearchIcon width={16} height={16} />
      {selectedMajors.length === 0 ? (
        <Placeholder>{placeholder}</Placeholder>
      ) : (
        selectedMajors.map((major, index) => (
          <MajorSelectedItem key={index} major={major} onRemove={onRemove} />
        ))
      )}
    </Container>
  );
};

export default MajorSearchInput;
