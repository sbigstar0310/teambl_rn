import {StyleSheet, Text} from "react-native";
import theme from "@/shared/styles/theme";
import {ReactNode, useMemo} from "react";
import {router} from "expo-router";

interface PostContentProps {
    content: api.Post["content"];
    taggedUsers: api.Post["tagged_users"];
}

type MentionEntity = {
    userId: number;
    text: string;
    offset: number;
    length: number;
}

/* Must consist of only Text components */
export default function PostContent(props: PostContentProps) {
    const mentionEntities = useMemo<MentionEntity[]>(() => {
        const entities = [] as MentionEntity[];
        for (const taggedUser of props.taggedUsers) {
            const userId = taggedUser.id;
            const text = taggedUser.profile.user_name;
            const matches = props.content.matchAll(new RegExp(text, "g"));
            for (const match of matches) {
                entities.push({userId, text, offset: match.index, length: text.length});
            }
        }
        entities.sort((a, b) => a.offset - b.offset);
        return entities;
    }, [props.content, props.taggedUsers]);

    const parts = useMemo<ReactNode[]>(() => {
        const parts = [] as ReactNode[];
        let lastIndex = 0;
        for (const entity of mentionEntities) {
            if (entity.offset > lastIndex) {
                parts.push(
                    <Text key={lastIndex}>
                        {props.content.slice(lastIndex, entity.offset)}
                    </Text>
                );
            }
            parts.push(
                <Text
                    key={entity.offset}
                    style={styles.mention}
                    onPress={() => goToProfile(entity.userId)}
                >
                    {entity.text}
                </Text>
            );
            lastIndex = entity.offset + entity.length;
        }
        if (lastIndex < props.content.length) {
            parts.push(
                <Text key={lastIndex}>
                    {props.content.slice(lastIndex)}
                </Text>
            );
        }
        return parts;
    }, [props.content, mentionEntities]);

    const goToProfile = (userId: number) => {
        router.push(`/profile/${userId}`);
    }

    return (
        <Text>
            {parts}
        </Text>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16
    },
    mention: {
        fontSize: 16,
        color: theme.colors.main
    }
})