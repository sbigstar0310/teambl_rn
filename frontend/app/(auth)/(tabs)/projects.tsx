import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {sharedStyles} from "@/app/_layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import {Fragment, useMemo, useState} from "react";
import ProjectCreateForm, {defaultFormData, ProjectCreateFormData} from "@/components/forms/ProjectCreateForm";


export default function ProjectsScreen() {
    const [data, setData] = useState<ProjectCreateFormData>(defaultFormData);

    const isValid = useMemo<boolean>(() => !!data.title && data.keywords.length >= 2, [data]);
    const handlePost = () => {
        console.log(data);
    }

    return (
        <Fragment>
            <View style={[sharedStyles.container]}>
                <ScreenHeader
                    title="프로젝트 작성"
                    actionButton={() => <PostButton disabled={!isValid} onPress={handlePost}/>}
                />
                <View style={sharedStyles.horizontalPadding}>
                    <ProjectCreateForm data={data} setData={setData}/>
                </View>
            </View>
        </Fragment>
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