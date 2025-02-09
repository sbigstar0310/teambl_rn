import { getCurrentUserId } from "@/shared/utils";
import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";
import { useRouter, useSearchParams } from "expo-router/build/hooks";
import { useState } from "react";

const ProfileDetailPage = () => {
    const router = useRouter();

    const id = useSearchParams().get("id");
    const [myId, setMyId] = useState(-99);

    const getMyId = async () => {
        const user = useAuthStore.getState().user;
        if (user && user.id) {
            setMyId(Number(user.id));
        }
    }
    
    if (myId === -99) {
        getMyId();
        return null;
    }
    if (`${id}` === `${myId}`) {
        return <Redirect href="/myprofile" />;
    } else {
        return <Redirect href={`/profiles/${id}/project`} />;
    }
};

export default ProfileDetailPage;
