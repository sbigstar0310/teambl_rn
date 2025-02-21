import styled from "@emotion/native";
import { FC, useState } from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import DeleteIcon from '@/assets/delete-x-icon.svg';

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
  font-family: "PretendardRegular";
  font-size: 14px;
`;

const XText = styled.Text`
  font-family: "PretendardRegular";
  color: #a8a8a8;
`;

const MajorSelectedItem: FC<Props> = ({ major, onRemove }) => {
  return (
    <Container>
      {/* Major Name */}
      <MajorText>{major}</MajorText>

      {/* Delete Icon */}
      <TouchableOpacity onPress={() => onRemove(major)}>
        <DeleteIcon/>
      </TouchableOpacity>
    </Container>
  );
};

export default MajorSelectedItem;
