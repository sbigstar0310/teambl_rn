import styled from "@emotion/native";
import { FC } from "react";
import { TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  selected: boolean;
  onClick: () => void;
  style?: ViewStyle;
};

const Circle = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border-width: 2px;
  justify-content: center;
  align-items: center;
`;

const InnerCircle = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: #2546f3;
`;

const SelectableCircleButton: FC<Props> = ({ selected, onClick, style }) => {
  return (
    <TouchableOpacity onPress={onClick}>
      <Circle>{selected && <InnerCircle />}</Circle>
    </TouchableOpacity>
  );
};

export default SelectableCircleButton;
