import React, { createContext, useContext, useRef } from "react";
import { Animated } from "react-native";

const ScrollContext = createContext<Animated.Value | null>(null);

import { ReactNode } from "react";

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
    const scrollY = useRef(new Animated.Value(0)).current;

    return (
        <ScrollContext.Provider value={scrollY}>
            {children}
        </ScrollContext.Provider>
    );
};

export const useScroll = () => {
    return useContext(ScrollContext);
};
