import theme from '@/shared/styles/theme';
import React, {Fragment, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ThreeDotsVertical from '@/assets/ThreeDotsVertical.svg';
import VerticalBar from '@/assets/VerticalBar.svg';
import AddPostIcon from '@/assets/AddPostIcon.svg';
import ProfileImagePreviewer from './ProfileImagePreviewer';
import ProjectBottomModal from './ProjectBottomModal';
import dayjs from "dayjs";

interface KeywordBadgeProps {
    keyword: string;
}

const KeywordBadge = (props: KeywordBadgeProps) => {
    const {
        keyword
    } = props;

    return (
        <View
            style={styles.keywordBadge}
        >
            <Text
                style={styles.keywordText}
            >
                {keyword}
            </Text>
        </View>
    );
};

interface AddPostButtonProps {
    onPress: () => void;
}

const AddPostButton = (props: AddPostButtonProps) => {
    const {onPress} = props;
    return (
        <TouchableOpacity
            style={styles.addPostButton}
            onPress={onPress}
        >
            <AddPostIcon/>
            <Text
                style={styles.addPostText}
            >
                게시물 작성
            </Text>
        </TouchableOpacity>
    );
}

interface SubscribeButtonProps {
    onPress: () => void;
}

const SubscribeButton = (props: SubscribeButtonProps) => {
    const {onPress} = props;
    return (
        <TouchableOpacity
            style={styles.subscribeButton}
            onPress={onPress}
        >
            <Text
                style={styles.subscribeText}
            >
                + 소식 받기
            </Text>
        </TouchableOpacity>
    );
}

interface ProjectPreviewProps {
    projectInfo: api.ProjectCard;
    myId: number;
}

const ProjectPreview = (props: ProjectPreviewProps) => {
    const {
        projectInfo,
        myId
    } = props;

    const [isOptionVisible, setIsOptionVisible] = useState(false);

    const formatDateToYearMonth = (date: Date) => {
        return dayjs(date).format('YYYY.MM');
    };

    const extractImages = (projectInfo: any) => {
        let images = [];
        images.push(projectInfo.creator.profile.image);
        projectInfo.accepted_users.map((user: any) => {
            images.push(user?.profile?.image);
        });
        return images;
    }

    return (
        <View
            style={styles.container}
        >
            <View
                style={styles.titleContainer}
            >
                <Text
                    style={styles.title}
                >
                    {projectInfo.title}
                </Text>
                <TouchableOpacity
                    style={{paddingLeft: 10}}
                    onPress={() => setIsOptionVisible(true)}
                >
                    <ThreeDotsVertical/>
                </TouchableOpacity>
            </View>
            {
                projectInfo.keywords.length > 0 &&
                <View
                    style={styles.keywordContainer}
                >
                    {
                        projectInfo.keywords.map((keyword: string, index: number) => {
                            return (
                                <KeywordBadge
                                    key={index}
                                    keyword={keyword}
                                />
                            );
                        })
                    }
                </View>
            }
            <View
                style={styles.descriptionContainer}
            >
                <Text
                    style={styles.descriptionText}
                >
                    {projectInfo.description}
                </Text>
            </View>
            <View
                style={styles.bottomTabContainer}
            >
                {projectInfo.start_date && ( // start_date can also be null
                    <Fragment>
                        <Text
                            style={styles.dateText}
                        >
                            {`${formatDateToYearMonth(projectInfo.start_date)} ~`}
                        </Text>
                        {
                            projectInfo.end_date &&
                            <Text
                                style={styles.dateText}
                            >
                                {` ${formatDateToYearMonth(projectInfo.end_date)}`}
                            </Text>
                        }
                        <VerticalBar
                            style={{marginLeft: 16, marginRight: 16}}
                        />
                    </Fragment>
                )}
                <ProfileImagePreviewer
                    imageUrlList={extractImages(projectInfo)}
                />
                {
                    projectInfo.creator.id === myId &&
                    <AddPostButton
                        onPress={() => console.log('add post')}
                    />
                }
                {/** 아래 true는 현재 로그인한 사용자가 해당 프로젝트를 구독했는지 여부의 negate로 수정 : TODO */}
                {
                    (projectInfo.creator.id !== myId) &&
                    <SubscribeButton
                        onPress={() => console.log('subscribe')}
                    />
                }
            </View>
            {/** bottom sheet */}
            <ProjectBottomModal
                isVisible={isOptionVisible}
                onClose={() => setIsOptionVisible(false)}
                isMyProject={projectInfo.creator.id === myId}
                projectId={projectInfo.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    titleContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: theme.fontSizes.body1,
        fontWeight: 600,
        color: theme.colors.black
    },
    keywordContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8
    },
    keywordBadge: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background2,
        borderRadius: 10,
        paddingHorizontal: 6,
        height: 17,
    },
    keywordText: {
        color: theme.colors.point,
        fontSize: theme.fontSizes.caption,
        fontWeight: 600
    },
    descriptionContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 20
    },
    descriptionText: {
        fontSize: theme.fontSizes.body1,
        fontWeight: 400,
        color: theme.colors.black
    },
    bottomTabContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 20
    },
    dateText: {
        fontSize: theme.fontSizes.caption,
        fontWeight: 400,
        color: theme.colors.achromatic01
    },
    addPostButton: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: 5,
        paddingHorizontal: 8,
        height: 28,
        marginLeft: 'auto',
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.achromatic03
    },
    subscribeButton: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.achromatic05,
        borderRadius: 5,
        paddingHorizontal: 8,
        height: 28,
        marginLeft: 'auto',
        gap: 8,
    },
    addPostText: {
        color: theme.colors.achromatic01,
        fontSize: theme.fontSizes.caption,
        fontWeight: 600
    },
    subscribeText: {
        color: theme.colors.black,
        fontSize: theme.fontSizes.caption,
        fontWeight: 600
    }
});

export default ProjectPreview;