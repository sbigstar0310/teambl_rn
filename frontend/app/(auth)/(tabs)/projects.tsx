import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import {useMemo, useState} from "react";
import ProjectCreateForm, {defaultFormData, ProjectCreateFormData} from "@/components/forms/ProjectCreateForm";
import {router} from "expo-router";
import Popup from "@/components/Popup";

export default function ProjectsScreen() {
    const [data, setData] = useState<ProjectCreateFormData>(defaultFormData);
    const isValid = useMemo<boolean>(() => !!data.title && data.keywords.length >= 2, [data]);
    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);

    const handlePost = () => {
        console.log(data);
    }

    const handleBack = () => {
        setIsConfirmationPopupOpen(false);
        setData(defaultFormData);
        router.back();
    }

    return (
        <View style={[sharedStyles.container]}>
            <ScreenHeader
                title="프로젝트 작성"
                onBack={setIsConfirmationPopupOpen.bind(null, true)}
                actionButton={() => <PostButton disabled={!isValid} onPress={handlePost}/>}
            />
            <ScrollView style={sharedStyles.horizontalPadding} showsVerticalScrollIndicator={false}>
                <ProjectCreateForm data={data} setData={setData}/>
            </ScrollView>
            <Popup
                isVisible={isConfirmationPopupOpen}
                onClose={setIsConfirmationPopupOpen.bind(null, false)}
                onConfirm={handleBack}
                title="작성 취소"
                description="저장하지 않으면 내용이 삭제됩니다. 작성을 종료하시겠습니까?"
                confirmLabel="작성 종료"
                closeLabel="계속 작성"
            />
        </View>
    )
}

interface PostButtonProps {
    disabled: boolean;
    onPress: () => void;
}

function PostButton(props: PostButtonProps) {
    return (
        <TouchableOpacity disabled={props.disabled} onPress={props.onPress}>
            <Text style={[styles.buttonText, props.disabled && styles.buttonTextDisabled]}>올리기</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonText: {
        color: "#2546F3",
        fontSize: 16
    },
    buttonTextDisabled: {
        color: "#A8A8A8"
    }
})