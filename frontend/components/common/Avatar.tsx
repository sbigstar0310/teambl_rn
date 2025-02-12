import {Image} from "react-native";
import DEFAULT_AVATAR_IMAGE from '@/assets/DefaultProfile.svg';

interface AvatarProps {
    imageURL?: string | null;
    size?: number;
}

const style = {borderRadius: 1000};

export default function Avatar(props: AvatarProps) {
    const size = props.size ?? 52;

    if (!props.imageURL) return (
        <DEFAULT_AVATAR_IMAGE
            width={size}
            height={size}
            style={style}
        />
    )
    return (
        <Image
            width={props.size ?? 52}
            height={props.size ?? 52}
            source={{uri: props.imageURL}}
            style={style}
        />
    );
}
