import styled from "@emotion/native";
import MajorSelectedItem from "./MajorSelectedItem";
import SearchIcon from "@/assets/search-icon.svg";
import React from "react";

type Props = {
  selectedMajors: string[];
  onPress: () => void;
  onRemove: (major: string) => void;
};

const Container = styled.Pressable`
  flex-direction: row;
  width: 100%;
  gap: 10px;
  background-color: #f5f5f5;
  align-items: center;
  border-radius: 5px;
  height: 40px;
`;

const MajorSearchInput: React.FC<Props> = ({
  selectedMajors,
  onPress,
  onRemove,
}) => {
  return (
    <Container onPress={onPress}>
      <SearchIcon width={16} height={16} style={{ marginLeft: 8 }} />
      {selectedMajors.map((major, index) => (
        <MajorSelectedItem key={index} major={major} onRemove={onRemove} />
      ))}
    </Container>
  );
};

export default MajorSearchInput;
