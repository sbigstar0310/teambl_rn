import React, { useEffect, useRef, useState } from 'react';
import "../../styles/Project/ProjectViewCommentInput.css";

const ProjectViewCommentInput = ({ isOpen, setIsOpen, text, setText, onSave, buttonText, placeholderText }) => {

    const inputRef = useRef(null);

    const [keyboardOffset, setKeyboardOffset] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            const newHeight = window.innerHeight;
            const keyboardHeight = window.screen.height - newHeight;
            setKeyboardOffset(keyboardHeight);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus({ preventScroll: false });
            inputRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isOpen]);

    if (!isOpen) {
        return <></>;
    }

    return (
        <div
            className='projectView-comment-input-modal-overlay'
            onClick={(e) => {
                setIsOpen(false);
                e.stopPropagation();
            }}
            style={{
                bottom: keyboardOffset
            }}
        >
            <div
                className='projectView-comment-input-modal-content'
                onClick={(e) => e.stopPropagation()}
            >
                <textarea
                    className='projectView-comment-input-modal-input'
                    ref={inputRef}
                    placeholder={
                        placeholderText ? placeholderText : "댓글을 입력해주세요."
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button
                    className='projectView-comment-input-modal-button'
                    onClick={async () => {
                        if (text.trim() !== "") {
                            await onSave();
                        }
                    }}
                >
                    {buttonText ? buttonText : "댓글 추가"}
                </button>
            </div>
        </div>
    );
};

export default ProjectViewCommentInput;