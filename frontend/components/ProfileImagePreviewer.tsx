import theme from '@/shared/styles/theme';
import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DefaultImage from "@/assets/DefaultProfile.svg";

interface ProfileImagePreviewerProps {
    imageUrlList: string[];
    onClick?: () => void;
}

const ProfileImagePreviewer: React.FC<ProfileImagePreviewerProps> = ({ imageUrlList = [], onClick = () => {} }) => {
    const MAX_VISIBLE = 2;
    const overflowCount = imageUrlList.length - MAX_VISIBLE;

    return (
        <TouchableOpacity
            onPress={onClick}
        >
            <View style={styles.container}>
                {imageUrlList.slice(0, MAX_VISIBLE).map((url, index) => (
                    (url != null) ? (
                        <Image
                            key={index}
                            source={{ uri: url }}
                            style={[styles.image, { marginLeft: index === 0 ? 0 : -5 }]}
                        />
                    ) : (
                        <DefaultImage
                            key={index}
                            style={[styles.image, { marginLeft: index === 0 ? 0 : -5 }]}
                        />
                    )

                ))}
                {overflowCount > 0 && (
                    <View style={[styles.moreContainer, { marginLeft: -5 }]}>
                        <Text style={styles.moreText}>+{overflowCount}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.white,
    },
    moreContainer: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.white,
        backgroundColor: theme.colors.achromatic01,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        fontSize: theme.fontSizes.caption,
        fontWeight: 400,
        color: theme.colors.white,
    },
});

export default ProfileImagePreviewer;
