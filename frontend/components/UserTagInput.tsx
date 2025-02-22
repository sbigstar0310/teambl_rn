import styled from "@emotion/native";
import UserSelectedItem from "./UserSelectedItem";
import SearchIcon from "@/assets/search-icon.svg";
import React from "react";

type Props = {
  selectedUsers: string[];
  placeholder: string;
  onPress: () => void;
  onRemove: (index: number) => void;
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
  font-family: "PretendardRegular";
  font-size: 16px;
`;

const UserTagInput: React.FC<Props> = ({
  selectedUsers,
  placeholder,
  onPress,
  onRemove,
}) => {
  return (
    <Container onPress={onPress}>
      <SearchIcon width={16} height={16} />
      {selectedUsers.length === 0 ? (
        <Placeholder>{placeholder}</Placeholder>
      ) : (
        selectedUsers.map((user, index) => (
          <UserSelectedItem key={index} user={user} onRemove={onRemove.bind(null, index)} />
        ))
      )}
    </Container>
  );
};

export default UserTagInput;
