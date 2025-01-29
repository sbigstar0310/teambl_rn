import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/shared/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

type RequestParams = {
    profile?: Partial<api.Profile>;
    imageFile?: { uri: string; type: string; name: string };
};

type Response = api.Profile;

// Profile과 ImageFile 두 가지로 나누어서 업데이트
const updateProfile = async (params: RequestParams): Promise<Response> => {
    try {
        // 1. Profile 정보 업데이트
        if (params.profile) {
            const _ = await api.put<Response>(
                "profile/current/update/",
                params.profile
            );
        }

        // 2. Image 정보 업데이트
        const formData = new FormData();

        // Append the image file if provided
        if (params.imageFile) {
            formData.append("image", {
                uri: params.imageFile.uri,
                type: params.imageFile.type, // e.g., 'image/jpeg'
                name: params.imageFile.name, // e.g., 'profile.jpg'
            } as any);
        }

        const response = await api.put<Response>(
            "profile/current/update/",
            formData,
            {
                headers: {
                    Accept: "application/json", // ✅ Ensures proper encoding
                    "Content-Type": "multipart/form-data", // ✅ Needed for files
                },
                transformRequest: (data, headers) => {
                    return data; // ⚠️ Ensures `axios` sends FormData correctly
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default updateProfile;
