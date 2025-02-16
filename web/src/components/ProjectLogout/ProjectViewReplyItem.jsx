import React, { useEffect, useRef, useState } from 'react';
import "../../styles/Project/ProjectViewReplyItem.css";
import "../../styles/Project/ProjectViewCommentItem.css";
import api from '../../api';
import SuspenseBox from '../SuspenseBox';
import ProfileDefaultImg from "../../assets/default_profile_image.svg";
import editIcon  from "../../assets/NewProject/project_edit_icon.svg";
import deleteIcon  from "../../assets/NewProject/project_delete_icon.svg";
import ConfirmPopUp from '../ConfirmPopUp';
import ProjectViewCommentInput from './ProjectViewCommentInput';

const MAX_HEIGHT = 30;

const ProjectViewReplyItem = ({ projectId, commentInfo, updateCommentList }) => {

    const userId = localStorage.getItem("userId");
    
    const textRef = useRef(null);
    const commentRef = useRef(null);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const [userInfo, setUserInfo] = useState({});

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [isReplyLoading, setIsReplyLoading] = useState(false);

    const [isOnError, setIsOnError] = useState(false);

    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEditInputOpen, setIsEditInputOpen] = useState(false);
    const [isReplyInputOpen, setIsReplyInputOpen] = useState(false);

    const [currentComment, setCurrentComment] = useState("");
    const [reply, setReply] = useState("");

    const fetchUserData = async () => {
        await setIsDataLoaded(false);
        await setIsOnError(false);
        
        try {
            const res = await api.get(`/api/user/${commentInfo['user']}/`);
            await setUserInfo(res.data);
        } catch (e) {
            console.log(e);
            await setIsOnError(true);
        } finally {
            await setIsDataLoaded(true);
        }
    };

    const deleteComment = async () => {
        await setIsDeleteLoading(true);
        try {
            await api.delete(`/api/comments/${commentInfo['id']}/delete/`);
            await updateCommentList();
        } catch (e) {
            console.log(e);
        } finally {
            await setIsDeleteLoading(false);
        }
    };

    const putComment = async () => {
        await setIsEditInputOpen(false);
        await setIsEditLoading(true);

        try {
            const requestBody = {
                content: currentComment
            };
            await api.put(`/api/comments/${commentInfo['id']}/edit/`, requestBody);
            await updateCommentList();
            if (commentRef.current) {
                commentRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (e) {
            console.log(e);
        } finally {
            await setIsEditLoading(false);
        }
    };
    
    const postReply = async () => {
        await setIsReplyInputOpen(false);
        await setIsReplyLoading(true);

        try {
            const requestBody = {
                content: reply,
                parent_comment: commentInfo['parent_comment']
            };
            await api.post(`/api/projects/${projectId}/comments/create/`, requestBody);
            await updateCommentList();
            if (commentRef.current) {
                commentRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (e) {
            console.log(e);
        } finally {
            await setIsReplyLoading(false);
        }
    };

    const checkImageLoaded = (imgElement) => {
        if (imgElement.complete) {
            setIsImageLoaded(true);
        }
    };

    /** utils */
    const getTimeDiff = (datetime) => {
        if (typeof datetime === "undefined") {
            return;
        } else {
            const now = new Date();
            const timeDifference = now - new Date(datetime);
            const seconds = Math.floor(timeDifference / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const months = Math.floor(days / 30);
            const years = Math.floor(days / 365);
        
            if (minutes < 1) {
                return '방금 전';
            } else if (minutes < 60) {
                return `${minutes}분 전`;
            } else if (hours < 24) {
                return `${hours}시간 전`;
            } else if (days < 30) {
                return `${days}일 전`;
            } else if (months < 12) {
                return `${months}개월 전`;
            } else {
                return `${years}년 전`;
            }
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        if (textRef.current) {
            if (textRef.current.scrollHeight > MAX_HEIGHT) {
                setIsOverflowing(true);
            } else {
                setIsOverflowing(false);
            }
        }
    }, [textRef, isDataLoaded]);

    useEffect(() => {
        if (commentInfo['user'] == null) {
            return;
        } else {
            fetchUserData();
        }
    }, [commentInfo['user']]);

    useEffect(() => {
        if (Object.keys(userInfo).length === 0) {
            return;
        }
        if (userInfo?.profile?.image) {
            const imgElement = new Image();
            imgElement.src = userInfo?.profile?.image;
            checkImageLoaded(imgElement);
        } else {
            setIsImageLoaded(true);
        }
    }, [userInfo]);

    useEffect(() => {
        if (commentInfo['content']) {
            setCurrentComment(commentInfo['content']);
        }
    }, [commentInfo]);

    return (
        <div
            className='projectView-replyItem-container'
            ref={commentRef}
        >
            {/** profile image */}
            <div className='projectView-commentItem-image-container'>
                <img
                    className={
                        `projectView-commentItem-image`
                        + `${(isImageLoaded && isDataLoaded) ? '' : ' projectView-commentItem-hidden'}`
                    }
                    src={userInfo?.profile?.image ? userInfo?.profile?.image : ProfileDefaultImg}
                    onLoad={() => setIsImageLoaded(true)}
                />
                {
                    ((!isImageLoaded) || (!isDataLoaded)) &&
                    <SuspenseBox
                        styleOv={{
                            display: 'inline-block',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%'
                        }}
                    />
                }
            </div>
            {/** content area */}
            <div className='projectView-commentItem-content-container'>
                {/** name & time & button */}
                <div className='projectView-commentItem-1st-row-container'>
                    {
                        (!isDataLoaded) &&
                        <>
                            <SuspenseBox
                                styleOv={{
                                    display: 'inline-block',
                                    width: '37px',
                                    height: '17px'
                                }}
                            />
                            <SuspenseBox
                                styleOv={{
                                    display: 'inline-block',
                                    width: '42px',
                                    height: '14px',
                                    marginLeft: '8px'
                                }}
                            />
                        </>
                    }
                    {
                        (isDataLoaded) &&
                        <>
                            <span className='projectView-commentItem-name'>
                                {userInfo.profile.user_name}
                            </span>
                            <span className='projectView-commentItem-time projectView-commentItem-ml-8'>
                                {getTimeDiff(commentInfo['created_at'])}
                            </span>
                        </>
                    }
                    {/** menu button */}
                    {
                        (commentInfo['user'] == userId) &&
                        <button
                            className='projectView-commentItem-button'
                            onClick={() => {
                                if (isDataLoaded) {
                                    setIsBottomSheetOpen(true);
                                }
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="3" height="15" viewBox="0 0 3 15" fill="none">
                                <circle cx="1.5" cy="1.5" r="1.5" transform="rotate(90 1.5 1.5)" fill="#595959"/>
                                <circle cx="1.5" cy="7.5" r="1.5" transform="rotate(90 1.5 7.5)" fill="#595959"/>
                                <circle cx="1.5" cy="13.5" r="1.5" transform="rotate(90 1.5 13.5)" fill="#595959"/>
                            </svg>
                        </button>
                    }
                </div>
                {/** text */}
                <div className='projectView-commentItem-2nd-row-container'>
                    {
                        (!isDataLoaded) &&
                        <SuspenseBox
                            styleOv={{
                                width: '100%',
                                height: '34px'
                            }}
                        />
                    }
                    {
                        isDataLoaded &&
                        <div
                            className='projectView-commentItem-comment-view-container'
                            ref={textRef}
                            style={{
                                maxHeight: isOverflowing ? (isExpanded ? "" : `${MAX_HEIGHT}px`) : ""
                            }}
                        >
                            {
                                commentInfo.content && commentInfo.content.split('\n').map((line, index) => {
                                    return (
                                        <span
                                            key={index}
                                            className={`projectView-commentItem-content-text`
                                                + `${((index + 1) === commentInfo.content.split('\n').length) ? " comment-last-line" : ""}`}
                                        >
                                            {
                                                (line.length === 0) ? '⠀' : line
                                            }
                                        </span>
                                    );
                                })
                            }
                            {
                                isDataLoaded && isOverflowing && (!isExpanded) &&
                                <button
                                    className='projectView-content-expand-button'
                                    onClick={toggleExpand}
                                >
                                    {"전체 보기"}
                                </button> 
                            }
                             {
                                isDataLoaded && isOverflowing && isExpanded &&
                                <button
                                    className='projectView-content-expand-button-close'
                                    onClick={toggleExpand}
                                >
                                    {"접기"}
                                </button> 
                            }
                        </div>
                    }
                </div>
                {/** reply button */}
                <div className='projectView-commentItem-3rd-row-container'>
                    <button
                        className='projectView-commentItem-reply-button'
                        onClick={() => {
                            if (!isReplyLoading) {
                                setReply("");
                                setIsReplyInputOpen(true);
                            }
                        }}
                    >
                        {"답글 달기"}
                    </button>
                </div>
            </div>
            {/** bottom sheet */}
            {
                isBottomSheetOpen &&
                <div
                    className='projectView-commentItem-pop-up-overlay'
                    onClick={() => setIsBottomSheetOpen(false)}
                >
                    <div
                        className='projectView-commentItem-content-area'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='projectView-commentItem-handle'>
                            {/** no content */}
                        </div>
                        <div className='projectView-commentItem-button-container'>
                            {/** edit */}
                            <button
                                className='projectView-commentItem-item-button projectView-commentItem-black projectView-ProfileMenu-mr-72'
                                onClick={() => {
                                    if ((!isDeleteLoading) && (!isEditLoading)) {
                                        setIsBottomSheetOpen(false);
                                        setIsEditInputOpen(true);
                                    }
                                }}
                            >
                                <div className='projectView-commentItem-button-icon-container'>
                                    <img src={editIcon} alt='edit'/>
                                </div>
                                <span className='projectView-commentItem-button-text'>
                                    {"수정"}
                                </span>
                            </button>
                            {/** delete */}
                            <button
                                className='projectView-commentItem-item-button projectView-commentItem-red'
                                onClick={() => {
                                    if (!isDeleteLoading) {
                                        setIsBottomSheetOpen(false);
                                        setIsDeleteConfirmOpen(true);
                                    }
                                }}
                            >
                                <div className='projectView-commentItem-button-icon-container'>
                                    <img src={deleteIcon} alt='edit'/>
                                </div>
                                <span className='projectView-commentItem-button-text'>
                                    {"삭제"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            }
            {/** delete confirmation */}
            <ConfirmPopUp
                isOpen={isDeleteConfirmOpen}
                setIsOpen={setIsDeleteConfirmOpen}
                message={"댓글을 정말 삭제하시겠습니까?"}
                onConfirm={deleteComment}
                onReject={() => setIsDeleteConfirmOpen(false)}
                confirmLabel={"댓글 삭제"}
                rejectLabel={"취소"}
                isCrucial={true}
            />
            {/** edit input */}
            <ProjectViewCommentInput
                isOpen={isEditInputOpen}
                setIsOpen={setIsEditInputOpen}
                text={currentComment}
                setText={setCurrentComment}
                onSave={async () => await putComment()}
                buttonText={"댓글 수정"}
                placeholderText={"수정 내용을 입력해주세요."}
            />
            {/** reply input */}
            <ProjectViewCommentInput
                isOpen={isReplyInputOpen}
                setIsOpen={setIsReplyInputOpen}
                text={reply}
                setText={setReply}
                onSave={async () => await postReply()}
                buttonText={"답글 추가"}
                placeholderText={"답글을 입력해주세요."}
            />
        </div>
    );
};

export default ProjectViewReplyItem;