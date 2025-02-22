import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import KeywordInput from "@/components/KeywordInput";
import { useState } from "react";
import DropdownContent from "@/components/DropdownContent";
import TextField from "@/components/TextField";
import { sharedStyles } from "@/app/_layout";
import BottomModal from "@/components/BottomModal";
import theme from "@/shared/styles/theme";
import DateRangePicker, {
    DateRange,
    toDateRangeString,
} from "@/components/DateRangePicker";
import SearchUsersWidget from "@/components/search/SearchUsersWidget";
import UserTagInput from "@/components/UserTagInput";

interface ProjectCreateFormProps {
    data: ProjectCreateFormData;
    setData: (data: ProjectCreateFormData) => void;
}

export default function ProjectCreateForm(props: ProjectCreateFormProps) {
    const { data, setData } = props;
    const [isPeriodInputModalOpen, setIsPeriodInputModalOpen] = useState(false);
    const [isMentionsModalOpen, setIsMentionsModalOpen] = useState(false);

    const handleTitleChange = (value: string) => {
        setData({ ...data, title: value });
    };

    const handleNewKeyword = (newKeyword: string) => {
        setData({ ...data, keywords: [...data.keywords, newKeyword] });
    };

    const handleKeywordRemove = (index: number) => {
        setData({
            ...data,
            keywords: data.keywords.filter((_, i) => i !== index),
        });
    };

    const handleNewMention = (newMention: api.User) => {
        setData({ ...data, mentions: [...data.mentions, newMention] });
        setIsMentionsModalOpen(false);
    };

    const handleMentionRemove = (index: number) => {
        setData({
            ...data,
            mentions: data.mentions.filter((_, i) => i !== index),
        });
    };

    const handleDescriptionChange = (value: string) => {
        setData({ ...data, description: value });
    };

    const handleTimePeriodChange = (value: DateRange) => {
        setData({ ...data, timePeriod: value });
        setIsPeriodInputModalOpen(false);
    };

    const handlePeriodInputModalOpen = setIsPeriodInputModalOpen.bind(
        null,
        true
    );
    const handlePeriodInputModalClose = setIsPeriodInputModalOpen.bind(
        null,
        false
    );
    const handleMentionsModalOpen = setIsMentionsModalOpen.bind(null, true);
    const handleMentionsModalClose = setIsMentionsModalOpen.bind(null, false);

    return (
        <View style={styles.container}>
            {/* Title */}
            <View style={styles.field}>
                <View style={styles.row}>
                    <Text style={sharedStyles.primaryText}>제목</Text>
                    <RequiredMark />
                </View>
                <TextField
                    defaultValue={data.title}
                    onChangeText={handleTitleChange}
                    placeholder="프로젝트 제목을 작성해 보세요."
                />
            </View>
            {/* Tags */}
            <View style={styles.field}>
                <View style={styles.row}>
                    <Text style={sharedStyles.primaryText}>키워드</Text>
                    <RequiredMark />
                    <Text style={sharedStyles.secondaryText}>최소 2개</Text>
                </View>
                <KeywordInput
                    maxNumber={3}
                    currentKeywordList={data.keywords}
                    onAdd={handleNewKeyword}
                    onRemove={handleKeywordRemove}
                    placeholderText="프로젝트를 설명하는 키워드를 적어보세요."
                    textInputPlaceholder="키워드를 입력해주세요"
                />
            </View>
            {/* Project members */}
            <DropdownContent title="사람 태그">
                <TouchableOpacity onPress={handleMentionsModalOpen}>
                    <UserTagInput
                        selectedUsers={data.mentions.map(user => user.profile.user_name)}
                        placeholder="함께하는 사람을 태그하세요."
                        onPress={handleMentionsModalOpen}
                        onRemove={handleMentionRemove}
                    />
                </TouchableOpacity>
                <BottomModal
                    heightPercentage={0.8}
                    visible={isMentionsModalOpen}
                    onClose={handleMentionsModalClose}
                    body={<SearchUsersWidget onConfirm={handleNewMention} />}
                />
            </DropdownContent>
            {/* Time period */}
            <DropdownContent title="기간">
                <TouchableOpacity onPress={handlePeriodInputModalOpen}>
                    <TextField
                        placeholder="프로젝트에 참여한 기간을 작성해 보세요."
                        editable={false}
                        defaultValue={
                            data.timePeriod
                                ? toDateRangeString(data.timePeriod)
                                : ""
                        }
                    />
                </TouchableOpacity>
                <BottomModal
                    visible={isPeriodInputModalOpen}
                    onClose={handlePeriodInputModalClose}
                    heightPercentage={0.45}
                    body={
                        <DateRangePicker
                            defaultValue={data.timePeriod}
                            onConfirm={handleTimePeriodChange}
                        />
                    }
                />
            </DropdownContent>
            {/* Introduction / Description */}
            <DropdownContent title="소개">
                <TextField
                    defaultValue={data.description ?? ""}
                    onChangeText={handleDescriptionChange}
                    placeholder="프로젝트를 간단하게 소개해 보세요."
                    multiline={true}
                    numberOfLines={4}
                    style={styles.descriptionTextField}
                    textAlignVertical={"top"}
                />
            </DropdownContent>
        </View>
    );
}

export function RequiredMark() {
    return <Text style={styles.requiredMark}>*</Text>;
}

interface PostButtonProps {
    disabled: boolean;
    onPress: () => void;
    label?: string;
}

export function PostButton(props: PostButtonProps) {
    return (
        <TouchableOpacity disabled={props.disabled} onPress={props.onPress}>
            <Text
                style={[
                    styles.buttonText,
                    props.disabled && styles.buttonTextDisabled,
                ]}
            >
                {props.label || "올리기"}
            </Text>
        </TouchableOpacity>
    );
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
    },
    requiredMark: {
        color: theme.colors.black,
        fontSize: 14,
        marginRight: 12
    },
    buttonText: {
        color: "#2546F3",
        fontSize: 16
    },
    buttonTextDisabled: {
        color: "#A8A8A8"
    },
    descriptionTextField: {
        height: 80
    }
});

export type ProjectCreateFormData = {
    title: string;
    keywords: string[];
    mentions: api.User[];
    timePeriod?: DateRange;
    description?: string;
};
export const defaultProjectFormData: ProjectCreateFormData = {
    title: "",
    keywords: [],
    mentions: [],
};
