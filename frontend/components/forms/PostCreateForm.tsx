import {StyleSheet, Text, View} from "react-native";
import TextField from "@/components/TextField";
import {sharedStyles} from "@/app/_layout";
import {RequiredMark} from "@/components/forms/ProjectCreateForm";

interface PostCreateFormProps {
    project: api.ProjectCard;
    data: PostCreateFormData;
    setData: (data: PostCreateFormData) => void;
}

export default function PostCreateForm(props: PostCreateFormProps) {
    const {data, setData} = props;

    const handleContentChange = (value: string) => {
        setData({...data, content: value.trim()});
    }

    return (
        <View style={styles.container}>
            {/* Project select input */}
            <View style={styles.field}>
                <View style={styles.row}>
                    <Text style={sharedStyles.primaryText}>프로젝트</Text>
                    <RequiredMark/>
                </View>
                <TextField
                    defaultValue={props.project.title}
                    placeholder="게시물 제목을 작성해 보세요."
                    editable={false}
                />
            </View>
            {/* Content */}
            <TextField
                defaultValue={data.content}
                onChangeText={handleContentChange}
                multiline={true}
                numberOfLines={15}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        gap: 24
    },
    row: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center"
    },
    field: {
        gap: 12
    }
})

export type PostCreateFormData = {
    content: string;
};
export const defaultPostFormData: PostCreateFormData = {
    content: ""
};