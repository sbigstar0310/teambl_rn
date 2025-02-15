import {Image, StyleSheet, TouchableOpacity, View} from "react-native";
import React, {useMemo, useState} from "react";
import ImagePreview from "@/components/conversations/ImagePreview";

interface PostImagesProps {
    images: api.PostImage[];
    previewEnabled?: boolean
}

export default function PostImages(props: PostImagesProps) {
    const {images} = props;
    const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
    const isPreviewEnabled = useMemo(() => props.previewEnabled ?? false, [props.previewEnabled]);

    const getPreviewHandler = (index: number) => {
        return isPreviewEnabled
            ? () => setPreviewImageUri(images[index].image)
            : undefined;
    }

    return (
        <View style={styles.container}>
            {images.length === 1 && (
                <SingleImage uri={images[0].image} onPreview={getPreviewHandler(0)}/>
            )}
            {images.length === 2 && (
                <View style={[styles.wrapper, styles.row]}>
                    <SingleImage uri={images[0].image} onPreview={getPreviewHandler(0)}/>
                    <SingleImage uri={images[1].image} onPreview={getPreviewHandler(1)}/>
                </View>
            )}
            {images.length >= 3 && (
                <View style={[styles.wrapper, styles.row]}>
                    <SingleImage uri={images[0].image} onPreview={getPreviewHandler(0)}/>
                    <View style={[styles.wrapper, styles.column]}>
                        <SingleImage uri={images[1].image} onPreview={getPreviewHandler(1)}/>
                        <SingleImage uri={images[2].image} onPreview={getPreviewHandler(2)}/>
                    </View>
                </View>
            )}
            <ImagePreview
                isVisible={previewImageUri !== null}
                onClose={setPreviewImageUri.bind(null, null)}
                imageUri={previewImageUri ?? ""}
            />
        </View>
    )
}

interface SingleImageProps {
    uri: string;
    onPreview?: () => void;
}

export function SingleImage(props: SingleImageProps) {
    if (props.onPreview) return (
        <TouchableOpacity onPress={props.onPreview} style={{flex: 1}}>
            <Image source={{uri: props.uri}} style={styles.image}/>
        </TouchableOpacity>
    )
    return <Image source={{uri: props.uri}} style={styles.image}/>
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 150,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
    },
    wrapper: {
        flex: 1,
        justifyContent: "space-between",
    },
    row: {
        flexDirection: 'row',
        gap: 2
    },
    column: {
        flexDirection: 'column',
        gap: 2
    }
});