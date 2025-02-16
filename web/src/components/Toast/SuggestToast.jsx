import React from 'react';
import "../../styles/Toast/Toast.css";
import { useNavigate } from 'react-router-dom';

/** This is a DEMO version. */
const SuggestToast = ({ isOpen, setIsOpen, userId }) => {

    const navigate = useNavigate();

    if (isOpen == null) {
        return <></>;
    }

    return (
        <div
            className={`suggestion-toast-container${isOpen ? ' sg-toast-show' : ' sg-toast-hide'}`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {/** close button */}
            <div
                className='suggeston-toast-button-container'
            >
                {/** title */}
                <span
                    className='suggeston-toast-title'
                >
                    {"프로필을 완성하고 "}
                    <span className='with-sg-toast-point-color'>
                        {"게시물"}
                    </span>
                    {"을 "}
                    <span className='with-sg-toast-point-color'>
                        {"추천 "}
                    </span>
                    {"받아보세요!"}
                </span>
                {/** close button */}
                <button
                    className='suggeston-toast-close-button'
                    onClick={() => setIsOpen(false)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 8.5L8.5 1.5M8.5 8.5L1.5 1.5" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            {/** message */}
            <div
                className='suggeston-toast-message-container'
            >
                <span
                    className='suggeston-toast-message'
                >
                    <span className='with-sg-toast-point-color'>
                        {"스킬"}
                    </span>
                    {"이나 "}
                    <span className='with-sg-toast-point-color'>
                        {"관심사"}
                    </span>
                    {"를 "}
                    <span className='with-sg-toast-point-color'>
                        {"2개 이상"}
                    </span>
                    {" 입력해주세요. "}
                </span>
                <span
                    className='suggeston-toast-message'
                >
                    <span className='with-sg-toast-point-color'>
                        {"관련 게시물"}
                    </span>
                    {"이 생기면 알려드릴게요."}
                </span>
            </div>
            {/** navigate button */}
            <div
                className='suggeston-toast-navigation-container'
            >
                <button
                    className='suggestion-toast-navigation-button'
                    onClick={() => navigate(`/profile/${userId}`)}
                >
                    {"프로필 완성하러 가기"}
                </button>
            </div>
        </div>
    );
};

export default SuggestToast;