import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import KeywordInput from "@/components/KeywordInput";
import {Fragment, useState} from "react";
import DropdownContent from "@/components/DropdownContent";
import TextField from "@/components/TextField";
import {sharedStyles} from "@/app/_layout";
import BottomModal from "@/components/BottomModal";
import theme from "@/shared/styles/theme";

interface ProjectCreateFormProps {
    data: ProjectCreateFormData;
    setData: (data: ProjectCreateFormData) => void;
}


export default function ProjectCreateForm(props: ProjectCreateFormProps) {
    const { data, setData } = props;
    const [isPeriodInputModalOpen, setIsPeriodInputModalOpen] = useState(false);
    const [isMentionsModalOpen, setIsMentionsModalOpen] = useState(false);

    const handleTitleChange = (value: string) => {
        setData({...data, title: value});
    }

    const handleKeywordsChange = (cb: (prevKeywords: string[]) => string[]) => {
        setData({...data, keywords: cb(data.keywords)});
    }

    const handleMentionsChange = (cb: (prevMentions: string[]) => string[]) => {
        setData({...data, mentions: cb(data.mentions)});
    }

    const handleDescriptionChange = (value: string) => {
        setData({...data, description: value});
    }

    const handlePeriodInputModalOpen = setIsPeriodInputModalOpen.bind(null, true);
    const handlePeriodInputModalClose = setIsPeriodInputModalOpen.bind(null, false);
    const handleMentionsModalOpen = setIsMentionsModalOpen.bind(null, true);
    const handleMentionsModalClose = setIsMentionsModalOpen.bind(null, false);

    return (
        <View style={styles.container}>
            {/* Title */}
            <View style={styles.field}>
                <View style={styles.row}>
                    <Text style={sharedStyles.primaryText}>제목</Text>
                    <RequiredMark/>
                </View>
                <TextField
                    defaultValue={data.title}
                    onChangeText={handleTitleChange}
                    placeholder="게시물 제목을 작성해 보세요."
                />
            </View>
            {/* Tags */}
            <View style={styles.field}>
                <View style={styles.row}>
                    <Text style={sharedStyles.primaryText}>키워드</Text>
                    <RequiredMark/>
                    <Text style={sharedStyles.secondaryText}>최소 2개</Text>
                </View>
                <KeywordInput
                    currentKeyworldList={data.keywords}
                    setCurrentKeywordList={handleKeywordsChange}
                    placeholderText="프로젝트를 설명하는 키워드를 적어보세요."
                />
            </View>
            {/* Project members */}
            <DropdownContent title="사람 태그">
                <TouchableOpacity onPress={handleMentionsModalOpen}>
                    <KeywordInput
                        currentKeyworldList={data.mentions}
                        setCurrentKeywordList={handleMentionsChange}
                        placeholderText="함께하는 사람을 태그하세요."
                    />
                </TouchableOpacity>
                <BottomModal
                    visible={isMentionsModalOpen}
                    onClose={handleMentionsModalClose}
                    body={<Fragment>
                        <Text>Mention search input goes here</Text>
                    </Fragment>}
                />
            </DropdownContent>
            {/* Time period */}
            <DropdownContent title="기간">
                <TouchableOpacity onPress={handlePeriodInputModalOpen}>
                    <TextField
                        placeholder="프로젝트에 참여한 기간을 작성해 보세요."
                        disabled={true}
                    />
                </TouchableOpacity>
                <BottomModal
                    visible={isPeriodInputModalOpen}
                    onClose={handlePeriodInputModalClose}
                    body={<Fragment>
                        <Text>Time Picker goes here</Text>
                    </Fragment>}
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
                />
            </DropdownContent>
        </View>
    )
}

function RequiredMark() {
    return (
        <Text style={styles.requiredMark}>*</Text>
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
    },
    requiredMark: {
        color: theme.colors.black,
        fontSize: 14,
        marginRight: 12
    }
})

export type ProjectCreateFormData = {
    title: string;
    keywords: string[];
    mentions: string[];
    timePeriod?: {
        start: Date;
        end?: Date;
    };
    description?: string;
}
export const defaultFormData: ProjectCreateFormData = {
    title: "",
    keywords: [],
    mentions: []
}