import React, { useState, useEffect } from "react";
import MessagePopUp from "../MessagePopUp";

const AddToHomePopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIos(/iphone|ipad|ipod/.test(userAgent));
        setIsAndroid(/android/.test(userAgent));
        const lastDismissed = localStorage.getItem('dismissedAt');
        const shouldShowPopup = !lastDismissed || Date.now() - lastDismissed > 7 * 24 * 60 * 60 * 1000; // 7일 경과 체크
        if (shouldShowPopup) {
            setIsVisible(true);
        }
    }, [isIos, isAndroid, isVisible]);

    const handleClose = () => {
        localStorage.setItem('dismissedAt', Date.now()); // 팝업 닫은 시간 저장
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="add-to-home-popup">
            {isIos && (
                <MessagePopUp
                    setIsOpen={setIsVisible}
                    message={
                        <p>⭐ 바로가기를 추가하려면 ⭐<br /> <br /> 
                        <strong>&quot;브라우저의 공유 버튼&quot;</strong>을 누르고 <br />
                        <strong>&quot;홈 화면에 추가&quot;</strong>를 선택하세요. </p>
                    }
                    confirmCallback={handleClose}
                />
            )}
            {isAndroid && (
                <MessagePopUp
                    setIsOpen={setIsVisible}
                    message={
                        <p>⭐ 바로가기를 추가하려면 ⭐<br /> <br /> 
                        <strong>&quot;브라우저의 설정 버튼&quot;</strong>을 누르고 <br />
                        <strong>&quot;홈 화면에 추가&quot;</strong>를 선택하세요. </p>
                    }
                    confirmCallback={handleClose}
                />
            )}
        </div>
    );
};

export default AddToHomePopup;