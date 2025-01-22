import { Image } from "react-native";
import { DEFAULT_AVATAR_IMAGE_URL } from "@/shared/constants";

interface AvatarProps {
    imageURL?: string | null;
    size?: number;
}

export default function Avatar(props: AvatarProps) {
    const imageURL = props.imageURL ?? DEFAULT_AVATAR_IMAGE_URL;
    const size = props.size ?? 52;

    return (
        <Image
            width={size}
            height={size}
            source={{ uri: imageURL }}
            style={{ borderRadius: 1000 }}
        />
    );
}
