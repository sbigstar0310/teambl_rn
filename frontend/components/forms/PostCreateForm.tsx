import {StyleSheet, Text, View} from "react-native";
import TextField from "@/components/TextField";
import {sharedStyles} from "@/app/_layout";
import {RequiredMark} from "@/components/forms/ProjectCreateForm";

interface PostCreateFormProps {
    data: PostCreateFormData;
    setData: (data: PostCreateFormData) => void;
}

export default function PostCreateForm(props: PostCreateFormProps) {
    const {data, setData} = props;

    const handleTitleChange = (value: string) => {
        const newId = parseInt(value);
        if (!isNaN(newId)) setData({...data, projectId: parseInt(value)});
    }

    const handleContentChange = (value: string) => {
        setData({...data, content: value});
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
                    defaultValue={data.projectId.toString()}
                    onChangeText={handleTitleChange}
                    placeholder="게시물 제목을 작성해 보세요."
                    keyboardType="numeric"
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
    projectId: number;
    content: string;
};
export const defaultPostFormData: PostCreateFormData = {
    projectId: 1,
    content: ""
};