import React from "react";
import {
  StyleSheet,
  View,
  ViewStyle,
  TouchableOpacity,
  Text,
} from "react-native";
import BottomModal from "./BottomModal";
import styled from "@emotion/native";
import SelectableCircleButton from "./SelectableCircleButton";

type Props = {
  visible: boolean;
  onClose: () => void;
  heightPercentage?: number;
  style?: ViewStyle;
  handleDegreeSelect: (degee: string) => void;
  selectedDegree: string;
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

const DegreeBottomModal: React.FC<Props> = ({
  handleDegreeSelect,
  selectedDegree,
  visible,
  onClose,
  style,
}) => {
  const degree_options = ["학사", "석사", "박사"];
  const body = (
    <View>
      {/* Title and Description */}
      <View style={[styles.hStack, styles.marginBottom32]}>
        <Title>재학 과정</Title>
        <Description>현재 재학 중인 과정을 선택해 주세요.</Description>
      </View>

      {/* Options */}
      <View style={styles.vStack}>
        {degree_options.map((degree) => (
          <View key={degree} style={styles.optionContainer}>
            <SelectableCircleButton
              selected={degree === selectedDegree}
              onClick={() => {
                handleDegreeSelect(degree);
              }}
            />
            <DegreeText>{degree}</DegreeText>
          </View>
        ))}
      </View>
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

export default DegreeBottomModal;
