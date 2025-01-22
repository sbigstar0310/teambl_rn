import { View, Text } from "react-native";
import React, { FC } from "react";

type Props = {
    projectCard: api.ProjectCard;
};

// ProjectCard 컴포넌트
// ProjectCard.posts가 없는 경우, projectCard를 보여줘야 함.
// TODO: ProjectCard 컴포넌트를 완성하기. 디자인 반영.

const ProjectCard: FC<Props> = ({ projectCard }) => {
    return (
        <View>
            <Text>{projectCard.title}</Text>
            <Text>{projectCard.description}</Text>
        </View>
    );
};

export default ProjectCard;
