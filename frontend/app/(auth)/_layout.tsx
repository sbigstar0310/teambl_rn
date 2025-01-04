import React, {useEffect} from "react";
import {router, Stack} from "expo-router";

export default function AuthLayout() {
    useEffect(() => {
        // TODO: Verify authentication
        const isAuthenticated = true;
        if (!isAuthenticated) router.replace("/login");
    }, []);

    return (
        <>
            {/* (auth) group is assumed as a screen by main Stack navigation router */}
            <Stack.Screen options={{headerShown: false}}/>
            {/* (auth) group needs a separate Stack navigation router for screens inside (e.g. home, search...) */}
            <Stack screenOptions={{headerShown: false}}/>
        </>
    );
}