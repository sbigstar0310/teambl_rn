import styled from "@emotion/native";
import { useState } from "react";
import { Text, View, ViewStyle } from "react-native";

type Props = {
  major: string;
  onPress: () => void;
  style?: ViewStyle;
  isSelected: boolean;
};

const Container = styled.Pressable`
  padding-vertical: 5.5px;
  padding-horizontal: 10px;
  border-bottom-color: #595959;
  border-radius: 24px;
  border-width: 0.8px;
`;

const MajorText = styled.Text`
  font-family: "pretendard";
  font-size: 18px;
  font-weight: medium;
  letter-spacing: -0.38px;
`;

const MajorItem: React.FC<Props> = ({ major, onPress, isSelected }) => {
  return (
    <Container
      onPress={onPress}
      style={isSelected ? { backgroundColor: "#2546F3" } : {}}
    >
      <MajorText style={isSelected ? { color: "#FFFFFF" } : {}}>
        {major}
      </MajorText>
    </Container>
  );
};

export default MajorItem;
