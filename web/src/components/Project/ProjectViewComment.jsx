import React, { useEffect, useMemo, useRef, useState } from 'react';
import "../../styles/Project/ProjectViewComment.css";
import ProfileDefaultImg from "../../assets/default_profile_image.svg";
import SuspenseBox from '../SuspenseBox';
import ProjectViewCommentInput from './ProjectViewCommentInput';
import api from '../../api';
import ProjectViewCommentItem from './ProjectViewCommentItem';
import { toastText } from '../Toast/Toast';

const ProjectViewComment = ({ isOpen, commentList, updateCommentList, projectId, userInfo }) => {
    
    const [profileImage, setProfileImage] = useState(""); // 프로필 이미지
    const inputRef = useRef(null);

    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isCommentSaveLoading, setIsCommentSaveLoading] = useState(false);
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);

    const [newComment, setNewComment] = useState("");

    // 프로필 이미지 가져오기
    const fetchProfileImage = async () => {
        try {
            const response = await api.get(`/api/profile/${userInfo}/`);
            setProfileImage(response.data.image); // Assuming the image field is 'image'
        } catch (error) {
            console.error("Failed to fetch profile image:", error);
        }
    };

    const topCommentList = useMemo(() => {
        if (commentList == null) {
            return [];
        }
        let rootCommentList = [];
        /** filter roots */
        commentList.forEach((commentInfo) => {
            if (commentInfo['parent_comment'] == null) {
                rootCommentList.push(commentInfo);
            }
        });
        return rootCommentList;
    }, [commentList]);

    const checkImageLoaded = (imgElement) => {
        if (imgElement.complete) {
            setIsImageLoaded(true);
        } else {
            setIsImageLoaded(false);
        }
    };

    const postComment = async () => {
        await setIsCommentSaveLoading(true);
        await setIsInputModalOpen(false);

        try {
            const requestBody = {
                content: newComment,
                parent_comment: null,
            };
            await api.post(`/api/projects/${projectId}/comments/create/`, requestBody);
            await updateCommentList();
            await setNewComment("");
        } catch (e) {
            console.log(e);
            toastText("댓글은 300자 제한입니다.");
        } finally {
            await setIsCommentSaveLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchProfileImage();
        };
        fetchData();
      }, []);

    useEffect(() => {
        if ((!isImageLoaded) && userInfo?.profile?.image) {
            const imgElement = new Image();
            imgElement.src = userInfo?.profile?.image;
            checkImageLoaded(imgElement);
        } else {
            setIsImageLoaded(true);
        }
    }, [userInfo]);

    useEffect(() => {
        setNewComment("");
    }, []);

    useEffect(() => {
        const handleResize = () => {
          if (window.visualViewport.height < window.innerHeight) {
            setIsKeyboardVisible(true);
          } else {
            setIsKeyboardVisible(false);
          }
        };
    
        window.visualViewport.addEventListener('resize', handleResize);
        return () => window.visualViewport.removeEventListener('resize', handleResize);
    }, []);

    if (!isOpen) {
        return <></>;
    }
    return (
        <>
            {/** comment input */}
            <div className='projectView-comment-input-container'>
                {/** profile image */}
                <img
                    className={`projectView-comment-profile-image`
                        + `${isImageLoaded ? '' : ' hidden'}`}
                    onLoad={() => setIsImageLoaded(true)}
                    src={
                        profileImage ?
                            profileImage
                            :
                            ProfileDefaultImg
                    }
                />
                {
                    (!isImageLoaded) &&
                    <SuspenseBox
                        styleOv={{
                            display: 'inline-block',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            marginRight: '12px'
                        }}
                    />
                }
                {/** input */}
                <input
                    type='text'
                    ref={inputRef}
                    className={`profileView-comment-input${isCommentSaveLoading ? ' projectView-comment-input-modal-disabled' : ''}`}
                    placeholder='댓글 작성하기...'
                    value={newComment}
                    onClick={async () => {
                        if (!isCommentSaveLoading) {
                            await inputRef.current.scrollIntoView({ behavior: "smooth" });
                            setIsInputModalOpen(true);
                        }
                    }}
                    readOnly
                />
                {/** input modal */}
                <ProjectViewCommentInput
                    isOpen={isInputModalOpen}
                    setIsOpen={setIsInputModalOpen}
                    text={newComment}
                    setText={setNewComment}
                    onSave={async () => await postComment()}
                />
            </div>
            {/** comment view */}
            {
                topCommentList.map((commentInfo => {
                    return (
                        <ProjectViewCommentItem
                            key={commentInfo['id']}
                            projectId={projectId}
                            commentInfo={commentInfo}
                            updateCommentList={updateCommentList}
                        />
                    );
                }))
            }
        </>
    );
};

export default ProjectViewComment;