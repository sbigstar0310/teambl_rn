import { getCurrentUserId } from "@/shared/utils";
import { Redirect } from "expo-router";
import { useRouter, useSearchParams } from "expo-router/build/hooks";

const ProfileDetailPage = () => {
    const router = useRouter();

    const id = useSearchParams().get("id");
    const myId = getCurrentUserId();

    if (`${id}` === `${myId}`) {
        return <Redirect href="/myprofile" />;
    } else {
        return <Redirect href={`/profiles/${id}/project`} />;
    }
};

export default ProfileDetailPage;
