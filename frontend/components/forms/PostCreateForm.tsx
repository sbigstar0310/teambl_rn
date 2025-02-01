import {
    Image,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextInputSelectionChangeEventData,
    TouchableOpacity,
    View
} from "react-native";
import TextField from "@/components/TextField";
import {sharedStyles} from "@/app/_layout";
import {RequiredMark} from "@/components/forms/ProjectCreateForm";
import ImageIcon from "@/assets/image-upload.svg";
import MentionIcon from "@/assets/mention-at-sign.svg";
import React, {useState} from "react";
import PostContent from "@/components/PostContent";
import {getAddedCharIndex} from "@/shared/utils";
import * as ImagePicker from "expo-image-picker";
import ImagePreview from "@/components/conversations/ImagePreview";
import XIcon from '@/assets/x-icon.svg';
import UserCard from "@/components/search/UserCard";
import theme from "@/shared/styles/theme";
import searchUserByName from "@/libs/apis/Search/searchUserByName";

interface PostCreateFormProps {
    projectTitle: string;
    data: PostCreateFormData;
    setData: React.Dispatch<React.SetStateAction<PostCreateFormData>>;
}

export default function PostCreateForm(props: PostCreateFormProps) {
    const {data, setData} = props;
    const contentInputRef = React.createRef<TextInput>();
    const [isMentioning, setIsMentioning] = useState(false);
    const [mentionOffset, setMentionOffset] = useState(0);
    const [mentionLength, setMentionLength] = useState(0);
    const [cursorSelection, setCursorSelection] = useState<{ start: number, end: number }>({start: 0, end: 0});
    const [previewImageUri, setPreviewImageUri] = useState<string | null>(null)
    const [searchResults, setSearchResults] = useState<api.UserSearchResult[]>([]);

    /* Content */
    const handleContentChange = (value: string) => {
        if (isMentioning) {
            const lengthChange = value.length - data.content.length;
            const newMentionLength = mentionLength + lengthChange;
            setMentionLength(newMentionLength);
            const removedIndex = getAddedCharIndex(value, data.content);
            if (removedIndex >= 0 && removedIndex === mentionOffset) {
                // Close mention modal
                setIsMentioning(false);
                setMentionOffset(0);
                setMentionLength(0);
                setSearchResults([]);
            } else {
                if (newMentionLength > 1) {
                    handleUserSearch(value.slice(mentionOffset + 1, mentionOffset + newMentionLength));
                } else {
                    setSearchResults([]);
                }
            }
        } else {
            const introducedIndex = getAddedCharIndex(data.content, value);
            if (introducedIndex >= 0) {
                // Open mention modal
                setIsMentioning(true);
                setMentionOffset(introducedIndex);
                setMentionLength(1);
            }
        }
        setData({...data, content: value});
    }
    /* Mention */
    const handleMentionInsertion = () => {
        if (contentInputRef.current) {
            const updatedContent =
                data.content.slice(0, cursorSelection.start)
                + "@"
                + data.content.slice(cursorSelection.end);
            setData({...data, content: updatedContent});
            setIsMentioning(true)
            setMentionOffset(cursorSelection.start);
            setMentionLength(1);
            contentInputRef.current.focus();
        }
    }
    const handleMentionSelection = (selectedUser: api.User) => {
        // Insert mention
        const text = selectedUser.profile.user_name;
        const updatedContent = data.content.slice(0, mentionOffset) + text + data.content.slice(mentionOffset + mentionLength);
        const updatedTaggedUsers = data.tagged_users.indexOf(selectedUser) === -1
            ? [...data.tagged_users, selectedUser]
            : data.tagged_users;
        setIsMentioning(false);
        setSearchResults([]);
        setData({...data, content: updatedContent, tagged_users: updatedTaggedUsers});
    }
    const handleCursorChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
        setCursorSelection(event.nativeEvent.selection);
    }
    const handleUserSearch = async (text: string) => {
        const newResults: api.UserSearchResult[] = await searchUserByName({user_name: text});
        setSearchResults(newResults);
    }
    /* Image attachment */
    const handleImageAdd = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            base64: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImage: PostImage = {
                uri: result.assets[0].uri,
                type: result.assets[0].mimeType || "image/jpeg",
                name: result.assets[0].fileName || "picture.jpg"
            }
            setData({...data, images: [...data.images, newImage]});
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = [...data.images];
        updatedImages.splice(index, 1);
        setData({...data, images: updatedImages});
    }
    const handleImagePreview = (index: number) => {
        setPreviewImageUri(data.images[index] ? data.images[index].uri : null);
    }
    const handleImagePreviewClose = () => {
        setPreviewImageUri(null);
    }

    return (
        <View style={sharedStyles.container}>
            <View style={[sharedStyles.horizontalPadding, styles.container]}>
                {/* Project select input */}
                <View style={styles.field}>
                    <View style={styles.row}>
                        <Text style={sharedStyles.primaryText}>프로젝트</Text>
                        <RequiredMark/>
                    </View>
                    <TextField
                        defaultValue={props.projectTitle}
                        placeholder="게시물 제목을 작성해 보세요."
                        editable={false}
                    />
                </View>
                {/* Content */}
                <TextInput
                    ref={contentInputRef}
                    style={styles.contentInput}
                    onChangeText={handleContentChange}
                    placeholder="나누고 싶은 글을 써보세요."
                    multiline={true}
                    textAlignVertical="top"
                    numberOfLines={15}
                    onSelectionChange={handleCursorChange}
                >
                    <PostContent
                        content={data.content}
                        taggedUsers={data.tagged_users}
                    />
                </TextInput>
                {/*Attached images*/}
                <View style={styles.row}>
                    {data.images.map((image, index) => (
                        <View key={index} style={styles.imageEntity}>
                            <TouchableOpacity onPress={handleImagePreview.bind(null, index)}>
                                <Image
                                    style={sharedStyles.roundedSm}
                                    source={{uri: image.uri}}
                                    width={96}
                                    height={96}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.xIcon}
                                onPress={handleRemoveImage.bind(null, index)}
                            >
                                <XIcon height={8} width={8}/>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <ImagePreview
                        isVisible={previewImageUri !== null}
                        onClose={handleImagePreviewClose}
                        imageUri={previewImageUri || ""}
                    />
                </View>
                <ScrollView
                    style={[styles.mentionModal, {display: isMentioning ? "flex" : "none"}]}
                    showsVerticalScrollIndicator={false}
                >
                    {searchResults.length === 0 && (
                        <Text style={{textAlign: "center", padding: 20}}>검색 결과가 없습니다.</Text>
                    )}
                    {searchResults.map((result, index) => (
                        <TouchableOpacity onPress={() => handleMentionSelection(result.user)} key={index}>
                            <UserCard
                                is_new_user={result.is_new_user}
                                relation_degree={result.relation_degree}
                                user={result.user}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleImageAdd}>
                    <ImageIcon/>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMentionInsertion}>
                    <MentionIcon/>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 16,
        gap: 16
    },
    row: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center"
    },
    field: {
        gap: 12
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        gap: 24,
        padding: 12,
        boxShadow: [{
            offsetX: 0,
            offsetY: -1,
            color: "#00000026",
            blurRadius: 1,
            spreadDistance: 0
        }]
    },
    imageEntity: {
        position: "relative"
    },
    xIcon: {
        position: "absolute",
        top: 4,
        right: 4,
        height: 20,
        width: 20,
        borderRadius: 999,
        backgroundColor: "rgba(18, 18, 18, 0.6)",
        alignItems: "center",
        justifyContent: "center"
    },
    mentionModal: {
        position: "absolute",
        bottom: 5,
        left: 15,
        zIndex: 99,
        height: 120,
        width: "100%",
        backgroundColor: theme.colors.white,
        borderRadius: 5,
        borderColor: theme.colors.achromatic04,
        borderWidth: 1
    }
})

export type PostImage = {
    uri: string;
    type: string;
    name: string;
}

export type PostCreateFormData = {
    content: string;
    tagged_users: api.User[];
    images: PostImage[];
};
export const defaultPostFormData: PostCreateFormData = {
    content: "",
    tagged_users: [],
    images: []
};