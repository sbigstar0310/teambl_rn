import {StyleSheet, Text, TextInput, View} from "react-native";
import PrimeButton from "@/components/PrimeButton";
import {useState} from "react";
import createReport from "@/libs/apis/Report/createReport";
import {sharedStyles} from "@/app/_layout";
import theme from "@/shared/styles/theme";

interface ReportCreateFormProps {
    onSubmit: () => void;
    related_project_card_id?: number;
    related_post_id?: number;
    related_comment_id?: number;
    related_user_id?: number;
}

export default function ReportCreateForm(props: ReportCreateFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            await createReport({
                content: content,
                related_project_card_id: props.related_project_card_id,
                related_post_id: props.related_post_id,
                related_comment_id: props.related_comment_id,
                related_user_id: props.related_user_id
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            props.onSubmit();
        }
    }

    return (
        <View style={styles.container}>
            <Text style={sharedStyles.primaryText}>
                신고하기
            </Text>
            <TextInput
                placeholder="신고 사유"
                value={content}
                onChangeText={setContent}
                multiline={true}
                numberOfLines={4}
                style={styles.input}
                textAlignVertical="top"
            />
            <PrimeButton
                text="신고하기"
                onClickCallback={handleSubmit}
                isActive={content.length > 0}
                isLoading={isSubmitting}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        gap: 16
    },
    input: {
        backgroundColor: theme.colors.achromatic05,
        padding: 10,
        borderRadius: 5,
        height: 100
    }
})