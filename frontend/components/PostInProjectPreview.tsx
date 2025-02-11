import theme from '@/shared/styles/theme';
import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import EmptyHeart from '@/assets/EmptyHeartIcon.svg';
import EmptyComment from '@/assets/CommentEmptyIcon.svg';
import ThreeDots from '@/assets/ThreeDotsVerticalSM.svg';
import {router} from "expo-router";

const PostInProjectPreview = (props: any) => {
    const { postInfo, myId } = props;
    const images = postInfo?.images || [];

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        const year = date.getFullYear().toString().slice(-2); // 연도의 마지막 두 자리
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1)
        const day = String(date.getDate()).padStart(2, '0'); // 일

        return `${year}.${month}.${day}`;
    }

    const goToDetailedPostView = () => {
        router.push(`/posts/${postInfo.id}`);
    }

    return (
        <View
            style={[styles.container, images.length > 0 ? { padding: 0 } : {}]}
        >
            {/** when image exists */}
            {images.length > 0 && (
                <TouchableOpacity
                    onPress={goToDetailedPostView}
                >
                    <View style={styles.imageContainer}>
                        {images.length === 1 && (
                            <Image source={{ uri: images[0] }} style={styles.singleImage} />
                        )}
                        {images.length === 2 && (
                            <View style={styles.twoImageWrapper}>
                                <Image source={{ uri: images[0] }} style={[styles.flexImage, styles.imageSpacingRight]} />
                                <Image source={{ uri: images[1] }} style={styles.flexImage} />
                            </View>
                        )}
                        {images.length >= 3 && (
                            <View style={styles.threeImageWrapper}>
                                <Image source={{ uri: images[0] }} style={[styles.leftImage, styles.imageSpacingRight]} />
                                <View style={styles.rightColumn}>
                                    <Image source={{ uri: images[1] }} style={[styles.flexImage, styles.imageSpacingBottom]} />
                                    <Image source={{ uri: images[2] }} style={styles.flexImage} />
                                </View>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            )}
            {/** content area */}
            <View
                style={[styles.contentContainer, images.length > 0 ? { padding: 16 } : {}]}
            >
                {/** content */}
                <TouchableOpacity
                    onPress={goToDetailedPostView}
                    style={{ width: '100%' }}
                >
                    <View
                        style={styles.contentTextContainer}
                    >
                        <Text
                            style={styles.contentText}
                            numberOfLines={3}
                            ellipsizeMode="tail"
                        >
                            {postInfo?.content}
                        </Text>
                    </View>
                </TouchableOpacity>
                {/** date */}
                <View
                    style={styles.dateContainer}
                >
                    <Text
                        style={styles.dateText}
                    >
                        {formatDate(postInfo?.created_at)}
                    </Text>
                </View>
                {/** footer */}
                <View
                    style={styles.footerContainer}
                >
                    {/** likes and comments */}
                    <TouchableOpacity
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                    >
                        <EmptyHeart />
                        <Text
                            style={styles.footerText}
                        >
                            {postInfo?.like_count}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}
                        onPress={goToDetailedPostView}
                    >
                        <EmptyComment />
                        <Text
                            style={styles.footerText}
                        >
                            {0}
                        </Text>
                    </TouchableOpacity>
                    {
                        (`${myId}` === `${postInfo?.user}`) &&
                        <TouchableOpacity
                            style={{ marginLeft: 'auto', paddingLeft: 15 }}
                        >
                            <ThreeDots />
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 5,
        padding: 16,
        backgroundColor: theme.colors.achromatic06,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentText: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        fontWeight: 400,
    },
    dateContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 4
    },
    dateText: {
        fontSize: theme.fontSizes.caption,
        fontWeight: 400,
        color: theme.colors.achromatic01
    },
    contentTextContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    footerContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 16
    },
    footerText : {
        fontSize: theme.fontSizes.body2,
        fontWeight: 400,
        color: theme.colors.achromatic01,
        marginLeft: 4
    },
    imageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    singleImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    twoImageWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
    },
    threeImageWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
    },
    leftImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    rightColumn: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    flexImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    imageSpacingRight: {
        marginRight: 4
    },
    imageSpacingBottom: {
        marginBottom: 4
    },
});

export default PostInProjectPreview;
