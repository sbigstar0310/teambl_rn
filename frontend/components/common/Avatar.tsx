import {Image} from "react-native";
import {DEFAULT_AVATAR_IMAGE_URL} from "@/shared/constants";

interface AvatarProps {
    imageURL?: string;
}

export default function Avatar(props: AvatarProps) {
    return <Image
        width={52}
        height={52}
        source={{uri: props.imageURL ?? DEFAULT_AVATAR_IMAGE_URL}}
        style={{borderRadius: 1000}}
    />;
}