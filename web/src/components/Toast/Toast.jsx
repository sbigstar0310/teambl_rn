import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "../../styles/Toast/Toast.css";

let showToast = null;

function ToastContainer() {
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
                className={`toast-container${
                    isVisible ? " toast-show" : " toast-hide"
                }`}
            >
                {toast}
            </div>
        )
    );
}
export function toastText(message) {
    if (showToast) {
        showToast(message);
    }
}

export function initToast() {
    const toastRoot = document.createElement("div");
    document.body.appendChild(toastRoot);
    // ReactDOM.render(<ToastContainer />, toastRoot);
    const root = createRoot(toastRoot); // React 18 방식으로 변경
    root.render(<ToastContainer />);
}
