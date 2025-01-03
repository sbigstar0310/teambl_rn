// import React, { Fragment, useEffect } from "react";
// import { router, Stack } from "expo-router";

// export const sharedStyles = {
//     container: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: "bold",
//     },
// };

// export default function AuthLayout() {
//     useEffect(() => {
//         // TODO: Verify authentication
//         const isAuthenticated = true;
//         if (!isAuthenticated) router.replace("/login");
//     }, []);

//     return (
//         <Fragment>
//             {/* (auth) group is assumed as a screen by main Stack navigation router */}
//             <Stack.Screen options={{ headerShown: false }} />
//             {/* (auth) group needs a separate Stack navigation router for screens inside (e.g. home, inbox...) */}
//             <Stack />
//         </Fragment>
//     );
// }

import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { StyleSheet } from "react-native";

export const sharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center", // Valid value
        alignItems: "center", // Valid value
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
});

export default function AuthLayout() {
    useEffect(() => {
        // TODO: Verify authentication
        const isAuthenticated = true;
        if (!isAuthenticated) router.replace("/login");
    }, []);

    return (
        <>
            {/* (auth) group is assumed as a screen by main Stack navigation router */}
            <Stack.Screen options={{ headerShown: false }} />
            {/* (auth) group needs a separate Stack navigation router for screens inside (e.g. home, inbox...) */}
            <Stack />
        </>
    );
}