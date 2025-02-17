import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../../styles/Toast/Toast.css";
import { createRoot } from "react-dom/client";

let showToast = null;

function BottomToastContainer() {
    const [toast, setToast] = useState(null); /** toast message */
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        showToast = (message) => {
            setToast(message);
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 3000);
            setTimeout(() => setToast(null), 3600);
        };
    }, []);

    return (
        toast && (
            <div
                className={`bot-toast-container${
                    isVisible ? " bot-toast-show" : " bot-toast-hide"
                }`}
            >
                {toast}
            </div>
        )
    );
}
export function toastBottomText(message) {
    if (showToast) {
        showToast(message);
    }
}

export function initBottomToast() {
    const toastRoot = document.createElement("div");
    document.body.appendChild(toastRoot);
    // ReactDOM.render(<BottomToastContainer />, toastRoot);
    const root = createRoot(toastRoot); // React 18 방식으로 변경
    root.render(<BottomToastContainer />);
}
