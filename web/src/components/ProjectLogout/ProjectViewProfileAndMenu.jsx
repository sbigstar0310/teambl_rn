import React, { useEffect, useState } from 'react';
import "../../styles/Project/ProjectViewProfileAndMenu.css";
import SuspenseBox from '../SuspenseBox';
import ProfileDefaultImg from "../../assets/default_profile_image.svg";
import linkIcon from "../../assets/NewProject/project_link_icon.svg";
import reportIcon from "../../assets/NewProject/project_report_icon.svg";
import editIcon  from "../../assets/NewProject/project_edit_icon.svg";
import deleteIcon  from "../../assets/NewProject/project_delete_icon.svg";
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmPopUp from '../ConfirmPopUp';
import MessagePopUp from '../MessagePopUp';
import api from '../../api';

const ProjectViewProfileAndMenu = ({ isLoading, isOwner, data, projectId, updateList, ownerId }) => {

    const navigate = useNavigate();

    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    /** deletion */
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [isResultMessageOpen, setIsResultMessageOpen] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const [isLoginConfirmOpen, setIsLoginConfirmOpen] = useState(false);

    const [copyMessage, setCopyMessage] = useState("");

    useEffect(() => {
        if (copyMessage) {
            const timer = setTimeout(() => setCopyMessage(""), 2000);
            return () => clearTimeout(timer);
        }
      }, [copyMessage]);

    /** copy and report TODO */
    const copyLink = async () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(`https://teambl.net/projects/${projectId}`)
                .then(() => {
                    const userAgent =
                        navigator.userAgent || navigator.vendor || window.opera;
                    // 안드로이드 환경인지 체크
                    const isAndroid = /android/i.test(userAgent);
                    // 안드로이드가 아닌 경우에만 메시지 출력
                    if (!isAndroid) {
                        setCopyMessage("링크가 복사되었습니다.");
                    }
                })
                .catch((err) => {
                    console.error("Failed to copy: ", err);
                });
        } else {
            alert("복사를 지원하지 않는 환경입니다.");
        }
        setIsBottomSheetOpen(false);
    };

    const reportProject = async () => {
        alert("신고가 접수되었습니다.");
        setIsBottomSheetOpen(false);
    };

    const moveToEditPage = async () => {
        await setIsBottomSheetOpen(false);
        navigate(`/projects/${projectId}/edit`);
    };

    const moveToLoginPage = async () => {
        await setIsBottomSheetOpen(false);
        navigate(`/`);
    };

    const deleteProject = async () => {
        await setIsDeleteConfirmOpen(false);
        await setIsDeleteLoading(true);
        await setIsResultMessageOpen(false);
        await setResultMessage("");

        try {
            await api.delete(`/api/projects/delete/${projectId}/`);
            await setResultMessage("성공적으로 삭제했습니다.");
        } catch (e) {
            console.log(e);
            await setResultMessage("삭제에 실패했습니다.");
        } finally {
            await setIsDeleteLoading(false);
            await setIsResultMessageOpen(true);
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

    const checkImageLoaded = (imgElement) => {
        if (imgElement.complete) {
            setIsImageLoaded(true);
        } else {
            setIsImageLoaded(false);
        }
    };

    const onImageLoadComplete = () => {
        setIsImageLoaded(true);
    };

    useEffect(() => {
        if (data?.user?.profile?.image) {
            const imgElement = new Image();
            imgElement.src = data?.user?.profile?.image;
            checkImageLoaded(imgElement);
        } else {
            setIsImageLoaded(true);
        }
    }, [data]);

    return (
        <div className='projectView-ProfileMenu-container'>
            {/** button */}
            <button
                className='projectView-ProfileMenu-button'
                onClick={() => setIsBottomSheetOpen(true)}    
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="4" viewBox="0 0 18 4" fill="none">
                    <circle cx="2" cy="2" r="2" fill="#595959"/>
                    <circle cx="9" cy="2" r="2" fill="#595959"/>
                    <circle cx="16" cy="2" r="2" fill="#595959"/>
                </svg>
            </button>
            {/** profile image */}
            {
                ((!isImageLoaded) || (isLoading)) &&
                <SuspenseBox
                    styleOv={{
                        width: '37px',
                        height: '37px',
                        borderRadius: '50%'
                    }}
                />
            }
            <img
                className={
                    `projectView-ProfileMenu-image `
                    + `${(isImageLoaded && (!isLoading)) ? '' : 'pf-img-hidden'}`
                }
                src={
                    data?.user?.profile?.image ?
                        data?.user?.profile?.image
                        :
                        ProfileDefaultImg
                }
                onLoad={onImageLoadComplete}
                onClick={() => {
                    setIsLoginConfirmOpen(true);
                }}
            />
            {/** login confirmation */}
            <ConfirmPopUp
                isOpen={isLoginConfirmOpen}
                setIsOpen={setIsLoginConfirmOpen}
                message={"프로필 확인은 로그인이 필요합니다.\n로그인 화면으로 이동하시겠습니까?"}
                onConfirm={moveToLoginPage}
                onReject={() => setIsLoginConfirmOpen(false)}
                confirmLabel={"이동"}
                rejectLabel={"취소"}
            />
            {/** name and school */}
            <div className='projectView-ProfileMenu-text-container'>
                <div className='projectView-ProfileMenu-name-and-button-container'>
                    {
                        isLoading &&
                        <SuspenseBox
                            styleOv={{
                                display: 'inline-block',
                                width: '37px',
                                height: '17px'
                            }}
                        />
                    }
                    {
                        (!isLoading) &&
                        <span className='projectView-ProfileMenu-name'>
                            {data?.user?.profile?.user_name}
                        </span>
                    }
                </div>
                <div className='projectView-ProfileMenu-school-container'>
                    {
                        isLoading &&  
                        <SuspenseBox
                            styleOv={{
                                display: 'inline-block',
                                width: '200px',
                                height: '14px'
                            }}
                        />
                    }
                    {
                        (!isLoading) &&
                        <span className='projectView-ProfileMenu-school'>
                            {
                                `${data?.user?.profile?.major1}`
                                + ` ・ `
                                + `${data?.user?.profile?.school}`
                                + ` ・ `
                                + ` ${getTimeDiff(data?.created_at)} `
                            }
                        </span>
                    }
                </div>
            </div>
            {/** bottom pop up */}
            {
                (!isOwner) && isBottomSheetOpen &&
                <div
                    className='projectView-ProfileMenu-pop-up-overlay'
                    onClick={() => setIsBottomSheetOpen(false)}
                >
                    <div
                        className='projectView-ProfileMenu-content-area'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='projectView-ProfileMenu-handle'>
                            {/** no content */}
                        </div>
                        <div className='projectView-ProfileMenu-button-container'>
                            {/** copy link */}
                            <button
                                className='projectView-ProfileMenu-item-button projectView-ProfileMenu-black projectView-ProfileMenu-mr-106'
                                onClick={copyLink}
                            >
                                <div className='projectView-ProfileMenu-button-icon-container'>
                                    <img src={linkIcon} alt='copy'/>
                                </div>
                                <span className='projectView-ProfileMenu-button-text'>
                                    {"링크 복사"}
                                </span>
                            </button>
                            {/** report link */}
                            <button
                                className='projectView-ProfileMenu-item-button projectView-ProfileMenu-red'
                                onClick={reportProject}
                            >
                                <div className='projectView-ProfileMenu-button-icon-container'>
                                    <img src={reportIcon} alt='report'/>
                                </div>
                                <span className='projectView-ProfileMenu-button-text'>
                                    {"신고"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            }
            {
                isOwner && isBottomSheetOpen &&
                <div
                    className='projectView-ProfileMenu-pop-up-overlay'
                    onClick={() => setIsBottomSheetOpen(false)}
                >
                    <div
                        className='projectView-ProfileMenu-content-area'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='projectView-ProfileMenu-handle'>
                            {/** no content */}
                        </div>
                        <div className='projectView-ProfileMenu-button-container'>
                            {/** copy link */}
                            <button
                                className='projectView-ProfileMenu-item-button projectView-ProfileMenu-black projectView-ProfileMenu-mr-72'
                                onClick={copyLink}
                            >
                                <div className='projectView-ProfileMenu-button-icon-container'>
                                    <img src={linkIcon} alt='copy'/>
                                </div>
                                <span className='projectView-ProfileMenu-button-text'>
                                    {"링크 복사"}
                                </span>
                            </button>
                            {/** edit */}
                            <button
                                className='projectView-ProfileMenu-item-button projectView-ProfileMenu-black projectView-ProfileMenu-mr-72'
                                onClick={() => {
                                    if (!isDeleteLoading) {
                                        moveToEditPage();
                                    }
                                }}
                            >
                                <div className='projectView-ProfileMenu-button-icon-container'>
                                    <img src={editIcon} alt='edit'/>
                                </div>
                                <span className='projectView-ProfileMenu-button-text'>
                                    {"수정"}
                                </span>
                            </button>
                            {/** delete */}
                            <button
                                className='projectView-ProfileMenu-item-button projectView-ProfileMenu-red'
                                onClick={() => {
                                    if (!isDeleteLoading) {
                                        setIsDeleteConfirmOpen(true);
                                    }
                                }}
                            >
                                <div className='projectView-ProfileMenu-button-icon-container'>
                                    <img src={deleteIcon} alt='edit'/>
                                </div>
                                <span className='projectView-ProfileMenu-button-text'>
                                    {"삭제"}
                                </span>
                            </button>
                            {/** delete confirmation */}
                            <ConfirmPopUp
                                isOpen={isDeleteConfirmOpen}
                                setIsOpen={setIsDeleteConfirmOpen}
                                message={"정말 해당 게시물을 삭제하시겠어요?"}
                                onConfirm={deleteProject}
                                onReject={() => setIsDeleteConfirmOpen(false)}
                                confirmLabel={"확인"}
                                rejectLabel={"취소"}
                            />
                            {/** message */}
                            {
                                isResultMessageOpen &&
                                <MessagePopUp
                                    setIsOpen={setIsResultMessageOpen}
                                    message={resultMessage}
                                    confirmCallback={async () => await updateList()}
                                />
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default ProjectViewProfileAndMenu;