import styled from "@emotion/native";
import { FC, useState } from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import DeleteIcon from "../assets/x-icon.svg";

type Props = {
  major: string;
  onRemove: (major: string) => void;
  style?: ViewStyle;
};

const Container = styled.Pressable`
  flex-direction: row;
  padding-vertical: 4px;
  padding-horizontal: 8px;
  background-color: #ffffff;
  border-radius: 5px;
  gap: 10px;
  align-items: center;
`;

const MajorText = styled.Text`
  font-family: "pretendard";
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.38px;
`;

const XText = styled.Text`
  font-family: "pretendard";
  color: #a8a8a8;
`;

const MajorSelectedItem: FC<Props> = ({ major, onRemove }) => {
  return (
    <Container>
      {/* Major Name */}
      <MajorText>{major}</MajorText>

      {/* Delete Icon */}
      <TouchableOpacity onPress={() => onRemove(major)}>
        <XText>X</XText>
      </TouchableOpacity>
    </Container>
  );
};

export default MajorSelectedItem;
