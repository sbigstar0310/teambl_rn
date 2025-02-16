import React, { useEffect, useMemo, useState } from 'react';
import "../../styles/Project/EditProject.css";
import backIcon from "../../assets/Profile/left-arrow.svg";
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import ItemEditor from '../../components/ItemEditor';
import { useDropzone } from 'react-dropzone';
import MessagePopUp from '../../components/MessagePopUp';
import FriendSelectPopUp from './FriendSelectPopUp';
import majorEdit from "../../assets/Profile/majorEdit.svg";
import PrimeButton from '../../components/PrimeButton';
import PeopleTagPopUp from '../../components/PeopleTagPopUp';
import { toastText } from '../../components/Toast/Toast';
const EditProject = () => {

    const navigate = useNavigate();

    const { projectId } = useParams();
    const currentUserId = localStorage.getItem("userId");

    /** meta states */
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState("");

    /** data states */
    const [prevData, setPrevData] = useState({}); /** fixed prev data */
    /** each field */
    const [currentTitleAndContent, setCurrentTitleAndContent] = useState({});
    const [prevImageList, setPrevImageList] = useState([]);
    const [deletedImageIdList, setDeletedImageIdList] = useState([]);
    const [imageList, setImageList] = useState([]); /** this is for new images */
    const [imagePreviewList, setImagePreviewList] = useState([]); /** this is for new images */
    const [friendList, setFriendList] = useState([]);
    const [selectedFriendList, setSelectedFriendList] = useState([]);
    const [contactList, setContactList] = useState([]);
    const [tagList, setTagList] = useState([]);

    /** modals */
    const [isImageNumberModalOpen, setIsImageNumberModalOpen] = useState(false);
    const [isFriendSelectPopUpOpen, setIsFriendSelectPopUpOpen] = useState(false);
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

    /** for image upload */
	const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) {
            return;
        }

        /** filter out already uploaded ones */
        const filteredFiles = acceptedFiles.filter(file => {
            return !imageList.some(prevImage => prevImage.name === file.name);
        });

        /** check length */
        if ((filteredFiles.length + imageList.length + prevImageList.length) > 5) {
            await setIsImageNumberModalOpen(true);
            return;
        }
		
		/** update profile image */
		await setImageList(prevImageList => {
            let newList = [...prevImageList, ...filteredFiles];
            return newList;
        });
	};

    /** image upload dropzone */
	const { getRootProps, getInputProps } = useDropzone({
		onDrop
	});

    /** image upload handler */
	const handleImageUploadClick = () => {
		document.getElementById("editProject-fileInput").click();
	};

    /** utils */
    const areObjectsEqual = (obj1, obj2) => {
        const sortObject = (obj) => {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }
            if (Array.isArray(obj)) {
                return obj.map(sortObject);
            }
            return Object.keys(obj).sort().reduce((sortedObj, key) => {
                sortedObj[key] = sortObject(obj[key]);
                return sortedObj;
            }, {});
        };
      
        const sortedObj1 = sortObject(obj1);
        const sortedObj2 = sortObject(obj2);
      
        return JSON.stringify(sortedObj1) === JSON.stringify(sortedObj2);
    };

    const removeImage = async (index) => {
        await setImageList(prevList => {
            let newList = [...prevList];
            newList.splice(index, 1);
            return newList;
        })
    };

    const removeFriend = async (index) => {
        await setSelectedFriendList(prevList => {
            let newList = [...prevList];
            newList.splice(index, 1);
            return newList;
        });
    };

    const removePrevImage = async (index) => {
        await setDeletedImageIdList(prevList => {
            let newList = [...prevList];
            newList.push(prevImageList[index]['id']);
            return newList;
        });
        await setPrevImageList(prevList => {
            let newList = [...prevList];
            newList.splice(index, 1);
            return newList;
        });
    };

    const updateHelper = async (key, value) => {
        await setCurrentTitleAndContent(prevObj => {
            let newObj = {...prevObj};
            newObj[key] = value;
            return newObj;
        });
    };

    /** isEdited tracker */
    const isEdited = useMemo(() => {
        if (Object.keys(prevData).length === 0) {
            return false;
        } else {
            /** make a new data */
            let newData = {
                "title" : currentTitleAndContent['title'],
                "content" : currentTitleAndContent['content'],
                "friendList" : selectedFriendList,
                "contactList" : contactList,
                "keywordList" : tagList,
                "imageList" : [...prevImageList, ...imageList]
            };
            return !areObjectsEqual(newData, prevData);
        }
    },
    [prevData,
    currentTitleAndContent,
    prevImageList,
    imageList,
    selectedFriendList,
    contactList,
    tagList]);

    const isValid = useMemo(() => {
        /** check required fields */
        if ((currentTitleAndContent['title'] === "")
            || (currentTitleAndContent['title'] == null)) {
            return false;
        }
        if ((currentTitleAndContent['content'] === "")
            || (currentTitleAndContent['content'] == null)) {
            return false;
        }
        if ((tagList.length <= 0) || (tagList == null)){
            return false;
        }
        return true;
    }, [currentTitleAndContent,
    prevImageList,
    imageList,
    selectedFriendList,
    contactList,
    tagList]);
    
    /** data fetch */
    const initData = async () => {
        await setIsDataLoading(true);
        await fetchProjectInfo();
        await fetchFriendList();
        await setIsDataLoading(false);
    };

    const fetchProjectInfo = async () => {
        try {
            /** get projects of the current user */
            const res = await api.get('/api/projects/');
            let projectList = res.data;
            let index = -1;
            for (let i=0 ; i<projectList.length ; i++) {
                if (projectList[i]['project_id'] == projectId) {
                    index = i;
                }
            }
            if (index === -1) {
                await setIsOwner(false);
                throw new Error("Cannot find the project.");
            } else {
                await setIsOwner(true);
                let newProjectInfo = projectList[index];

                /** get image list */
                let prevImages = newProjectInfo['images'];

                /** get tag list */
                let prevKeywordList = newProjectInfo['keywords'];
                
                /** get contact list */
                let prevContactList = [];
                if (newProjectInfo['contacts'] == null) {
                    prevContactList = [];
                } else if (typeof newProjectInfo['contacts'] === "string") {
                    prevContactList.push(newProjectInfo['contacts']);
                } else {
                    newProjectInfo['contacts'].forEach(contactInfo => {
                        prevContactList.push(contactInfo['contact_info']);
                    });
                }

                /** get friend list */
                let prevFriendList = newProjectInfo['tagged_users'];

                /** NEW : serialize friend list */
                prevFriendList = prevFriendList.map(prevInfo => {
                    let newInfo = {...prevInfo};
                    Object.keys(newInfo['profile']).forEach(key => {
                        newInfo[key] = newInfo['profile'][key];
                    });
                    return newInfo;
                });

                /** get project title and content */
                let prevTitle = newProjectInfo['title'];
                let prevContent = newProjectInfo['content'];

                /** set fixed data */
                let newPrevData = {
                    "title" : prevTitle,
                    "content" : prevContent,
                    "friendList" : prevFriendList,
                    "contactList" : prevContactList,
                    "keywordList" : prevKeywordList,
                    "imageList" : prevImages
                };
                
                /** set prev data */
                await setPrevData(JSON.parse(JSON.stringify(newPrevData)));
                
                /** title & content */
                await setCurrentTitleAndContent({
                    "title" : prevTitle,
                    "content" : prevContent
                });

                /** image */
                await setPrevImageList([...prevImages]);

                /** tag(keyword) */
                await setTagList([...prevKeywordList]);
                
                /** friend */
                await setSelectedFriendList([...prevFriendList]);

                /** contact */
                await setContactList([...prevContactList]);
            }
        } catch (e) {
            console.log(e);
            await setIsError(true);
            await setIsDataLoading(false);
        }
    };

    const fetchFriendList = async () => {
        try {
            /** get my information */
            let tempMyId = -999;
            const myRes = await api.get('/api/current-user/');
            tempMyId = myRes.data.id;
            const res = await api.get('/api/friends/one-degree/');
            /** delete me */
            let filteredList = res.data.filter(item => {
                return (item.id !== tempMyId);
            });
            /** 동명이인 처리 : 이메일 추가 */
            const nameCount = filteredList.reduce((acc, user) => {
                acc[user.user_name] = (acc[user.user_name] || 0) + 1;
                return acc;
            }, {});
            let updatedList = filteredList.map(user => {
                if (nameCount[user.user_name] > 1) {
                  return {
                    ...user,
                    user_name: `${user.user_name} (${user.email})`
                  };
                }
                return user;
            });
            await setFriendList(updatedList);
        } catch (e) {
            console.log(e);
            await setFriendList([]);
            await setIsError(true);
            await setIsDataLoading(false);
        }
    };

    /** save : patch method */
    const putProject = async () => {
        await setIsSaveLoading(true);
        await setNoticeMessage("");
        await setIsNoticeModalOpen(false);
        try {
             /** make a new form */
            const formData = new FormData();
            formData.append("title", currentTitleAndContent['title']);
            formData.append("content", currentTitleAndContent['content']);
            contactList.forEach((contactInfo) => {
                formData.append("contacts[]", contactInfo);
            });
            tagList.forEach((keyword) => {
                formData.append("keywords[]", keyword);
            });
            selectedFriendList.forEach((user) => {
                formData.append("tagged_users[]", user.id);
            });
            imageList.forEach((image) => {
                formData.append("images", image);
            });
            deletedImageIdList.forEach((imageId) => {
                formData.append("images_to_delete[]", imageId);
            });
            /** patch */
            await api.patch(`/api/projects/${projectId}/edit/`, formData, {
                headers : {
                    "Content-Type" : "multipart/form-data"
                }
            });
            await setNoticeMessage("저장되었습니다.");
        } catch (e) {
            console.log(e);
            await setNoticeMessage("저장에 실패했습니다.");
        } finally {
            await setIsNoticeModalOpen(true);
            await setIsSaveLoading(false);
        }
    };

    /** effects */
    useEffect(() => {
        initData();
    }, [projectId]);

    useEffect(() => { /** update image preview */
        if (imageList.length === 0) {
            setImagePreviewList([]);
        } else {
            const newPreviewList = [];
            let filesLoaded = 0;

            imageList.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newPreviewList[index] = e.target.result;
                    filesLoaded += 1;

                    if (filesLoaded === imageList.length) {
                        setImagePreviewList(newPreviewList);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    }, [imageList]);

    const handleBackButton = () => {
        if ( isEdited ) {
            toastText("저장되지 않은 변경 사항이 있습니다.\n저장 후 이동하세요!")
            scrollToSaveButton();
        } else {
            window.history.back();
        }
    };

    // 화면 자동 스크롤 처리
    const scrollToSaveButton = () => {
        document.getElementById("savebtn")?.scrollIntoView({ behavior: "smooth"});
    };

    // 브라우저 리로드, 닫기 방지
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isEdited) {
                toastText("저장되지 않은 변경 사항이 있습니다.\n저장 후 이동하세요!")
                scrollToSaveButton();
                e.preventDefault();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isEdited]);

    if (isDataLoading) {
        return (
			<div className="editProject-loader-container">
			  <div className="editProject-loader" />
			</div>
		);
    }
    if (isError) {
        return (
			<div className="editProject-body editProject-with-pd-28">
			  <div className="editProject-container">
				{/** Backward button */}
				<div className="editProject-backward-btn-container">
				  <button
					className="editProject-backbutton"
					onClick={() => window.history.back()}
				  >
					<img src={backIcon} />
				  </button>
				</div>
			  </div>
			  <div className="editProject-error-container">
				{"게시글 정보를 불러오는 데 실패했습니다."}
			  </div>
			</div>
		);
    }
    if (!isOwner) {
        return (
			<div className="editProject-body editProject-with-pd-28">
			  <div className="editProject-container">
				{/** Backward button */}
				<div className="editProject-backward-btn-container">
				  <button
					className="editProject-backbutton"
					onClick={() => window.history.back()}
				  >
					<img src={backIcon} />
				  </button>
				</div>
			  </div>
			  <div className="editProject-error-container">
				{"해당 게시글에 수정 권한이 없습니다."}
			  </div>
			</div>
		);
    }

    return (
        <div className='editProject-body'>
            <div className="editProject-container">
				{/** Backward button */}
				<div className="editProject-backward-btn-container">
				  <button
					className="editProject-backbutton"
					onClick={() => handleBackButton()}
				  >
					<img src={backIcon} />
				  </button>
				</div>
			</div>
            {/** Title */}
			<div className='editProject-title-container'>
				{"게시물 수정하기"}
			</div>
            {/** 제목 */}
            <div className='editProject-field-title-container editProject-with-mt-32'>
                <span className='editProject-field-title'>
                    {"제목"}
                </span>
                <span className='editProject-field-title-star'>
                    {"*"}
                </span>
            </div>
            <input
                className='editProject-field-input editProject-with-mt-12'
                placeholder='게시물 제목을 작성해 보세요.'
                value={currentTitleAndContent['title']}
                onChange={async (e) => await updateHelper("title", e.target.value)}
            />
            {/** 키워드 */}
            <div className='editProject-field-title-container editProject-with-mt-24'>
                <span className='editProject-field-title'>
                    {"키워드"}
                </span>
                <span className='editProject-field-title-star'>
                    {"*"}
                </span>
                <span className='editProject-field-subtitle'>
                    {"최대 5개"}
                </span>
            </div>
            <div className='editProject-contact-container editProject-with-mt-12'>
                <ItemEditor
                    type={"tag"}
                    currentItemList={tagList}
                    setCurrentItemList={setTagList}
                    placeholderMsg={"키워드 작성은 게시물 검색을 용이하게 합니다."}
                    maxItemNum={5}
                />
            </div>
            {/** 내용 */}
            <div className='editProject-field-title-container editProject-with-mt-24'>
                <span className='editProject-field-title'>
                    {"내용"}
                </span>
                <span className='editProject-field-title-star'>
                    {"*"}
                </span>
            </div>
            <div className='editProject-textarea-container editProject-with-mt-12'>
                <textarea
                    className='editProject-textarea'
                    placeholder={"게시물와 관련된 내용을 자유롭게 작성해 보세요.\n게시물 관련된 링크는 필요시 글에 첨부해 주세요."}
                    value={currentTitleAndContent['content']}
                    onChange={async (e) => await updateHelper("content", e.target.value)}
                />
            </div>
            {/** 이미지 첨부 */}
            <div className='editProject-field-title-container editProject-with-mt-24'>
                <span className='editProject-field-title'>
                    {"이미지 첨부"}
                </span>
                <span className='editProject-field-subtitle'>
                    {"최대 5개까지 첨부 가능"}
                </span>
            </div>
            <div className='editProject-image-container editProject-with-mt-12'>
                {/** image preview or message */}
                {
                    ((imageList.length + prevImageList.length) === 0) &&
                    <div 
                        className='editProject-image-message-container'
                        onClick={handleImageUploadClick}
                        {...getRootProps()}
                    >
                        <span className='editProject-image-message'>
                            {"게시물과 관련된 이미지를 첨부해 보세요."}
                        </span>
                    </div>
                }
                {
                    ((imageList.length + prevImageList.length) > 0) &&
                    <div className='editProject-image-preview-container'>
                        {/** prev images */}
                        {
                            (prevImageList.length > 0) && prevImageList.map((imageData, index) => {
                                return (
                                    <div
                                        key={imageData['id']}
                                        className='editProject-image-preview'
                                    >
                                        <img
                                            src={imageData['image']}
                                        />
                                        <button
                                            className='editProject-image-preview-cancle-btn'
                                            onClick={async () => await removePrevImage(index)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M1.5 8.5L8.5 1.5M8.5 8.5L1.5 1.5" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })
                        }
                        {/** new images */}
                        {
                            (imagePreviewList.length > 0) && imagePreviewList.map((imageData, index) => {
                                return (
                                    <div
                                        key={imageData}
                                        className='editProject-image-preview'
                                    >
                                        <img
                                            
                                            src={imageData}
                                        />
                                        <button
                                            className='editProject-image-preview-cancle-btn'
                                            onClick={async () => await removeImage(index)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M1.5 8.5L8.5 1.5M8.5 8.5L1.5 1.5" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })
                        }
                    </div>
                }
                {/** horizontal bar */}
                <div className='editProject-horizontal-bar editProject-with-mt-16'>
                    {/** no content */}
                </div>
                {/** add button */}
                <div
                    className='editProject-add-button-container'
                    onClick={handleImageUploadClick}
                    {...getRootProps()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                        <path d="M6.5 1V11" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M11.5 6L1.5 6" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className='editProject-add-button-text editProject-with-ml-8'>
                        {"추가하기"}
                    </span>
                    <input
                        {...getInputProps()}
                        id="editProject-fileInput"
                        type="file"
                        style={{ display: "none" }}
                        multiple
                    />
                </div>
            </div>
            {/** 일촌 태그 */}
            <div className='editProject-field-title-container editProject-with-mt-24'>
                <span className='editProject-field-title'>
                    {"사람 태그"}
                </span>
            </div>
            <div
                className='editProject-friend-container editProject-with-mt-12'
                onClick={() => {
                    setIsFriendSelectPopUpOpen(true);
                }}
            >
                <img
                    src={majorEdit}
                    alt="검색"
                />
                {
                    (selectedFriendList.length === 0) &&
                    <div className='editProject-friend-message-container'>
                        <span className='editProject-friend-message editProject-with-ml-8 editProject-with-mb-12-5'>
                            {"게시물을 함께하는 사람을 태그하세요."}
                        </span>
                    </div>
                }
                {
                    (selectedFriendList.length > 0) &&
                    <div className='editProject-element-container'>
                        {
                            selectedFriendList.map((friendInfo, index) => (
                                <div
                                    key={friendInfo.id}
                                    className={"editProject-element editProject-with-ml-8"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {friendInfo['user_name']}
                                    <button
                                        className="editProject-remove-element"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFriend(index);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M1.5 8.5L8.5 1.5M8.5 8.5L1.5 1.5" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                }
            </div>
            {/** 연락처 */}
            <div className='editProject-field-title-container editProject-with-mt-24'>
                <span className='editProject-field-title'>
                    {"연락처"}
                </span>
            </div>
            <div className='editProject-contact-container editProject-with-mt-12'>
                <ItemEditor
                    type={"string"}
                    currentItemList={contactList}
                    setCurrentItemList={setContactList}
                    placeholderMsg={"연락 가능한 수단을 추가해주세요."}
                    maxItemNum={999}
                />
            </div>
            {/** save button */}
            <PrimeButton
                text={"저장"}
                onClickCallback={
                    async () => {
                        if (isValid && isEdited && (!isSaveLoading)) {
                            await putProject();
                        }
                    }
                }
                isActive={isValid && isEdited && (!isSaveLoading)}
                isLoading={isSaveLoading}
                styleOv={{
                    marginTop: '32px'
                }}
            />
            <div id = "savebtn"></div>
            {/** modals */}
            {
                isImageNumberModalOpen &&
                <MessagePopUp
                    setIsOpen={setIsImageNumberModalOpen}
                    message={"이미지는 최대 5장까지 업로드할 수 있습니다."}
                />
            }
            {/** 일촌 태그 카드 */}
            {
                isFriendSelectPopUpOpen &&
                <PeopleTagPopUp
                    isPopUpOpen={isFriendSelectPopUpOpen}
                    setIsPopUpOpen={setIsFriendSelectPopUpOpen}
                    selectedPeopleList={selectedFriendList}
                    setSelectedPeopleList={setSelectedFriendList}
                    maxSelectNum={999}
                    myId={localStorage.getItem("userId")}
                />
            }
            {/** 알림창 */}
            {
                isNoticeModalOpen &&
                <MessagePopUp 
                    setIsOpen={setIsNoticeModalOpen}
                    message={noticeMessage}
                    confirmCallback={async () => {
                        navigate(`/profile/${currentUserId}?deft-route=project#${projectId}`,
                            {
                                defaultInnerRoute: "project",
                                state: {
                                    EditProject: true
                                }
                            });
                    }}
                />
            }
        </div>
    );
};

export default EditProject;