import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function AuthLayout() {
    useEffect(() => {
        // TODO: Verify authentication
        const isAuthenticated = useAuthStore.getState().isLoggedIn;
        if (!isAuthenticated) router.replace("/login");
    }, [useAuthStore.getState().isLoggedIn]);

    return (
        <>
            {/* (auth) group is assumed as a screen by main Stack navigation router */}
            <Stack.Screen options={{ headerShown: false }} />
            {/* (auth) group needs a separate Stack navigation router for screens inside (e.g. home, search...) */}
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}
