import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getUserInfo from "@/libs/apis/User/getUserInfo";
import login from "@/libs/apis/login";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/shared/constants";

export type AuthStoreState = {
    isLoggedIn: boolean;
    user?: api.User;
};

export type AuthStoreAction = {
    login: (email: string, password: string) => void;
    logout: () => void;
    updateUser: (user: api.User) => void;
};

export const useAuthStore = create<AuthStoreState & AuthStoreAction>((set) => ({
    isLoggedIn: false,
    user: undefined,
    login: async (email, password) => {
        try {
            const response = await login({ email, password });
            const userData = await getUserInfo(response.userId);

            // Save User data to AsyncStorage
            // This is duplicated with login.ts, but just in case of deletion of login.ts.
            AsyncStorage.setItem(ACCESS_TOKEN, response.access);
            AsyncStorage.setItem(REFRESH_TOKEN, response.refresh);
            AsyncStorage.setItem(USER_ID, response.userId.toString());

            set({ user: userData, isLoggedIn: true });
        } catch (error) {
            console.error("Login failed:", error);
        }
    },
    logout: async () => {
        try {
            // Remove all stored tokens and user ID
            await AsyncStorage.removeItem("ACCESS_TOKEN");
            await AsyncStorage.removeItem("REFRESH_TOKEN");
            await AsyncStorage.removeItem("USER_ID");

            set({ user: undefined, isLoggedIn: false });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },
    updateUser: (user) => {
        set({ user });
    },
}));
