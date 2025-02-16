import React, { useEffect, useState } from 'react';
import "../../styles/Experience/Experience.css";
import backIcon from "../../assets/Profile/left-arrow.svg";
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { toastText } from '../../components/Toast/Toast';
import majorEdit from "../../assets/Profile/majorEdit.svg";
import PeopleTagPopUp from '../../components/PeopleTagPopUp';
import ItemEditor from '../../components/ItemEditor';
import DatePicker from '../../components/DatePicker';

const EditExperience = () => {

    const navigate = useNavigate();

    const myId = parseInt(localStorage.getItem("userId"));
    const { expId } = useParams();

    /** meta */
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [isTitleChanged, setIsTitleChanged] = useState(false);
    const [isInvitationChanged, setIsInvitationChanged] = useState(false);
    const [isDetailChanged, setIsDetailChanged] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    /** data */
    const [fixedExpInfo, setFixedExpInfo] = useState({});
    const [fixedDetailInfo, setFixedDetailInfo] = useState({});
    const [newTitle, setNewTitle] = useState("");
    const [newDetail, setNewDetail] = useState({});
    const [userInfoList, setUserInfoList] = useState([]);
    const [acceptedUserList, setAcceptedUserList] = useState([]);
    const [pendingInvitationList, setPendingInvitationList] = useState([]);
    const [deleteTargetUserList, setDeleteTargetUserList] = useState([]);

    /** invitation */
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
    const [currentInvitationList, setCurrentInvitationList] = useState([]);
    const [isInvitationLoading, setIsInvitationLoading] = useState(false);

    const saveExpAndExpInfo = async () => {
        await setIsSaveLoading(true);
        try {
            if (isTitleChanged || isInvitationChanged) {
                /** update prev members */
                if (deleteTargetUserList.length > 0) {
                    await removePeople(deleteTargetUserList);
                }
                /** update invitations */
                await api.put(`/api/experiences/${expId}/update/`, {
                    title: newTitle,
                    pending_invitations: pendingInvitationList
                });
            }
            if (isDetailChanged) {
                await api.put(`/api/experience-details/${fixedDetailInfo['id']}/update/`, {
                    "description": newDetail['description'],
                    "start_date": newDetail['start_date'],
                    "end_date": newDetail['end_date'],
                    "skills_used": newDetail['skills_used'],
                    "tags": newDetail['tags']
                });
            }
            toastText("경험이 수정되었습니다.");
            navigate(`/profile/${myId}`, {
                state: {
                    ...location.state,
                    tempTargetExpId: expId,
                    AddExp: true
                }
            });
        } catch (e) {
            console.log(e);
            toastText("저장에 실패했어요.");
        } finally {
            await setIsSaveLoading(false);
        }
    };

    const fetchExpInfo = async (totalRefresh) => {
        if ((totalRefresh != null) && totalRefresh) {
            await setIsLoading(true);
        }

        try {
            const res = await api.get(`/api/experiences/${myId}/`);
            let newExpList = res.data;
            let newExpInfo = {};
            let newExpDetailInfo = {};
            let userIdList = [myId];

            let isFound = false;
            newExpList.forEach((tempExp) => {
                if (tempExp.id == expId) {
                    isFound = true;
                    newExpInfo = { ...tempExp };
                }
            });
            if (!isFound) {
                throw new Error("Cannot find the target experience.");
            }

            isFound = false;
            newExpInfo['experience_detail'].forEach(tempDetail => {
                if (tempDetail['user'] == myId) {
                    isFound = true;
                    newExpDetailInfo = { ...tempDetail };
                }
            });
            if (!isFound) {
                throw new Error("Cannot find the target experience detail of the user.");
            }

            /** get user informations */
            userIdList = [...userIdList, ...newExpInfo['accepted_users']];
            newExpInfo['pending_invitations'].forEach(pInv => {
                if (!userIdList.includes(pInv['invitee'])) {
                    userIdList.push(pInv['invitee']);
                }
                if (!userIdList.includes(pInv['inviter'])) {
                    userIdList.push(pInv['inviter']);
                }
            });
            await fetchUserInfoList(userIdList, newExpInfo['accepted_users']);
            await setPendingInvitationList(newExpInfo['pending_invitations']);

            await setFixedExpInfo(newExpInfo);
            await setFixedDetailInfo(newExpDetailInfo);
            await setNewTitle(newExpInfo['title']);
            await setNewDetail(JSON.parse(JSON.stringify(newExpDetailInfo)));
            await setIsValid(true);
            await setIsTitleChanged(false);
            await setIsDetailChanged(false);
            await setIsInvitationChanged(false);
        } catch (e) {
            console.log(e);
            await setIsError(true);
        } finally {
            await setIsLoading(false);
        }
    };

    /** @deprecated */
    const updateInvitationInfo = async () => { /** NOT USED due to logic change */
        try {
            const res = await api.get(`/api/experiences/${myId}/`);
            let newExpList = res.data;
            let newExpInfo = {};
            let userIdList = [myId];

            let isFound = false;
            newExpList.forEach((tempExp) => {
                if (tempExp.id == expId) {
                    isFound = true;
                    newExpInfo = { ...tempExp };
                }
            });
            if (!isFound) {
                throw new Error("Cannot find the target experience.");
            }

            /** get user informations */
            userIdList = [...userIdList, ...newExpInfo['accepted_users']];
            newExpInfo['pending_invitations'].forEach(pInv => {
                if (!userIdList.includes(pInv['invitee'])) {
                    userIdList.push(pInv['invitee']);
                }
                if (!userIdList.includes(pInv['inviter'])) {
                    userIdList.push(pInv['inviter']);
                }
            });
            await fetchUserInfoList(userIdList, newExpInfo['accepted_users']);
            await setPendingInvitationList(newExpInfo['pending_invitations']);
        } catch (e) {
            await setPendingInvitationList([]);
            console.log(e);
        }
    };

    const invitePeople = async (peopleList) => {
        // await setCurrentInvitationList([]);
        // if (peopleList.length === 0) {
        //     return;
        // }
        // await setIsInvitationLoading(true);
        // if (peopleList.length > 0) {
        //     try {
        //         await Promise.all(peopleList.forEach(async (peopleInfo) => {
        //             await api.post(`/api/experiences/invitations/create/`, {
        //                 "experience_id": expId,
        //                 "invitee_id": peopleInfo['id']
        //             });
        //         }));
        //     } catch (e) {
        //         console.log(e);
        //         toastText("사용자를 초대하는 데 실패했습니다.");
        //     }
        // }
        // await updateInvitationInfo();
        // await setIsInvitationLoading(false);
        // toastText(`${peopleList.length} 명을 초대했어요.`);
        /** Change logic */
        await setUserInfoList(prevState => {
            let newState = [...prevState];
            peopleList.forEach(people => {
                newState.push({ ...people });
            });
            return newState;
        });
        await setPendingInvitationList(prevState => {
            let newState = [...prevState];
            peopleList.forEach(people => {
                newState.push({
                    "experience": expId,
                    "inviter": myId,
                    "invitee": people['id'],
                    "status": "pending"
                });
            });
            return newState;
        });
        await setCurrentInvitationList([]);
    };

    const removePeopleById = async (userId) => {
        if (userId == myId) {
            toastText("본인은 삭제할 수 없습니다.");
            return;
        }
        await setAcceptedUserList(prevState => {
            let newState = [...prevState];
            newState = newState.filter(userInfo => {
                return (userInfo.id != userId);
            });
            return newState;
        });
        await setDeleteTargetUserList(prevState => {
            let newState = [...prevState];
            newState.push(userId);
            return newState;
        });
    };

    /** Actual member deletion */
    const removePeople = async (deleteTargetUserIds) => {
        /** delete details */
        const deletePromises = deleteTargetUserIds.map(async (userId) => {
            const targetDetail = findDetailByUserId(userId);
    
            if (!targetDetail) {
                return;
            }
    
            try {
                if (targetDetail) {
                    await api.delete(`/api/experience-details/${targetDetail['id']}/delete/`);
                }
            } catch (error) {
                console.log(error);
                console.error(`Failed to delete detail for userId: ${userId}`, error);
            }
        });
        await Promise.all(deletePromises);

        /** save "accepted_users" */
        await api.put(`api/experiences/${expId}/update/`, {
            accepted_users: acceptedUserList.map(obj => obj.id)
        });
    };

    const removeInvitation = async (id) => {
        // try {
        //     await api.delete(`/api/experiences/invitations/delete/${id}/`);
        //     toastText("초대를 삭제했어요.");
        //     await updateInvitationInfo();
        // } catch (e) {
        //     console.log(e);
        // }
        /** Change the logic */
        await setPendingInvitationList(prevState => {
            let newState = [...prevState];
            newState = newState.filter(invObj => {
                return !((invObj.invitee == id) && (invObj['status'] === "pending"));
            });
            return newState;
        });
    };

    const fetchUserInfoList = async (userIdList, acceptedIdList) => {
        /** get each user information */
        let tempAcceptedUsers = [];
        const tempUserInfoList = await Promise.all(userIdList.map(async (targetUserId) => {
            try {
                const res = await api.get(`/api/user/${targetUserId}/`);
                if (acceptedIdList.includes(targetUserId)) {
                    if ((tempAcceptedUsers.find(obj => obj.id === targetUserId)) == null) {
                        tempAcceptedUsers.push({ ...res.data });
                    }

                }
                return { ...res.data };
            } catch (e) {
                console.log(e);
                return {
                    'id': targetUserId,
                    'user_name': '알 수 없음'
                };
            }
        }));
        await setAcceptedUserList(tempAcceptedUsers);
        await setUserInfoList(tempUserInfoList);
    };

    /** utils */
    const findDetailByUserId = (userId) => {
        if ((!fixedExpInfo)
            || (!fixedExpInfo['experience_detail'])
            || (fixedExpInfo['experience_detail'].length <= 0)) {
            return null;
        }
        for (let i = 0; i < fixedExpInfo['experience_detail'].length; i++) {
            if (userId == fixedExpInfo['experience_detail'][i]['user']) {
                return { ...fixedExpInfo['experience_detail'][i] };
            }
        }
        return null;
    };

    const findUserInfoById = (userId) => {
        if (userInfoList.length <= 0) {
            return null;
        }
        for (let i = 0; i < userInfoList.length; i++) {
            if (userId == userInfoList[i]['id']) {
                return { ...userInfoList[i] };
            }
        }
        return null;
    };

    const updateHelper = async (key, value) => {
        await setNewDetail(prevState => {
            let newState = { ...prevState };
            newState[key] = value;
            return newState;
        });
    };

    const areStringListsEqual = (list1, list2) => {
        if (list1.length !== list2.length) {
            return false;
        }

        const sortedList1 = [...list1].sort();
        const sortedList2 = [...list2].sort();

        return sortedList1.every((value, index) => value === sortedList2[index]);
    };

    const areObjectListsEqual = (list1, list2) => {
        if (list1.length !== list2.length) return false;

        const sortedList1 = list1.map(obj => JSON.stringify(sortObjectKeys(obj))).sort();
        const sortedList2 = list2.map(obj => JSON.stringify(sortObjectKeys(obj))).sort();

        return sortedList1.every((item, index) => item === sortedList2[index]);
    }

    const sortObjectKeys = (obj) => {
        const sortedKeys = Object.keys(obj).sort();
        const sortedObj = {};
        for (const key of sortedKeys) {
            sortedObj[key] = obj[key];
        }
        return sortedObj;
    }

    useEffect(() => {
        fetchExpInfo(true);
    }, [expId]);

    /** validation */
    useEffect(() => {
        let isTitleValid = true;
        let isDetailValid = true;

        if (newTitle.trim() === "") {
            isTitleValid = false;
        }

        if (fixedExpInfo['creator'] == myId) { /** creator */
            /** check required */
            // at least one keyword 
            isDetailValid = isDetailValid && (newDetail['tags'] != null);
            isDetailValid = isDetailValid && (newDetail['tags'].length >= 1);
            // no empty description
            isDetailValid = isDetailValid && (newDetail['description'] != null);
            isDetailValid = isDetailValid && (newDetail['description'].trim() !== "");
        } else {
            /** check required */
            // No required fields : pass
        }

        /** check validity (common) */
        if (newDetail['tags']) {
            isDetailValid = isDetailValid && (newDetail['tags'].length <= 5);
        }

        setIsValid(isTitleValid && isDetailValid);
    }, [fixedExpInfo, fixedDetailInfo, newTitle, newDetail]);

    /** change tracker */
    useEffect(() => {
        if (((Object.keys(fixedExpInfo).length === 0) || (Object.keys(fixedDetailInfo).length === 0))) {
            return
        }
        setIsTitleChanged(newTitle !== fixedExpInfo['title']);

        /** detail */
        let isDetailChanged = false;

        /** keyword(tags) */
        isDetailChanged = isDetailChanged
            || (!areStringListsEqual(newDetail['tags'], fixedDetailInfo['tags']));
        /** duration */
        isDetailChanged = isDetailChanged
            || (newDetail['start_date'] != fixedDetailInfo['start_date'])
            || (newDetail['end_date'] != fixedDetailInfo['end_date'])
        /** skill */
        isDetailChanged = isDetailChanged
            || (!areStringListsEqual(newDetail['skills_used'], fixedDetailInfo['skills_used']));
        /** description(content) */
        isDetailChanged = isDetailChanged
            || (newDetail['description'] != fixedDetailInfo['description']);
        setIsDetailChanged(isDetailChanged);

        /** invitation */
        let isInvitationChanged = false;

        /** pending-invitations */
        isInvitationChanged = isInvitationChanged || (!areObjectListsEqual(fixedExpInfo['pending_invitations'], pendingInvitationList));

        /** accepted-users */
        isInvitationChanged = isInvitationChanged || (deleteTargetUserList.length > 0);

        setIsInvitationChanged(isInvitationChanged);

    }, [fixedExpInfo, fixedDetailInfo, newTitle, newDetail, deleteTargetUserList, pendingInvitationList]);


    const handleBackButton = () => {
        if (isDetailChanged || isTitleChanged || isInvitationChanged) {
            toastText("저장되지 않은 변경 사항이 있습니다.\n저장 후 이동하세요!")
            scrollToSaveButton();
        } else {
            window.history.back();
        }
    };

    // 화면 자동 스크롤 처리
    const scrollToSaveButton = () => {
        document.getElementById("savebtn")?.scrollIntoView({ behavior: "smooth" });
    };

    // 브라우저 리로드, 닫기 방지
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDetailChanged || isTitleChanged || isInvitationChanged) {
                toastText("저장되지 않은 변경 사항이 있습니다.\n저장 후 이동하세요!")
                scrollToSaveButton();
                e.preventDefault();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isDetailChanged, isTitleChanged, isInvitationChanged]);

    if (isLoading) {
        return (
            <div className="exp-loader-container">
                <div className="exp-loader" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="exp-body exp-with-pd-28">
                <div className="exp-container">
                    {/** Backward button */}
                    <div className="exp-backward-btn-container">
                        <button
                            className="exp-backbutton"
                            onClick={() => window.history.back()}
                        >
                            <img src={backIcon} />
                        </button>
                    </div>
                </div>
                <div className="exp-error-container">
                    {"경험 정보를 불러오는 데 실패했습니다."}
                </div>
            </div>
        );
    }

    if ((Object.keys(fixedExpInfo).length > 0) && (Object.keys(fixedDetailInfo).length > 0)) {
        return (
            <div className="exp-body exp-with-pd-28">
                <div className="exp-container">
                    {/** Backward button */}
                    <div className="exp-backward-btn-container">
                        <button
                            className="exp-backbutton"
                            onClick={() => handleBackButton()}
                        >
                            <img src={backIcon} />
                        </button>
                    </div>
                </div>
                {/** Title */}
                <div className='exp-title-container'>
                    {"경험 작성하기"}
                </div>
                {/** -- Body -- */}
                {/** Name */}
                <div className='exp-field-title-container exp-with-mt-32'>
                    <span className='exp-field-title'>
                        {"이름"}
                    </span>
                    <span className='exp-field-title-star'>
                        {"*"}
                    </span>
                </div>
                <input
                    className={`exp-field-input exp-with-mt-12${(fixedExpInfo['creator'] != myId) ? ' exp-input-disabled' : ''}`}
                    placeholder='프로젝트 이름을 작성해 보세요.'
                    value={newTitle}
                    onChange={async (e) => await setNewTitle(e.target.value)}
                    readOnly={fixedExpInfo['creator'] != myId}
                    onClick={() => {
                        if (fixedExpInfo['creator'] != myId) {
                            toastText(`관리자(${findUserInfoById(fixedExpInfo['creator'])['user_name']})만 수정할 수 있어요.`);
                        }
                    }}
                />
                {/** Member */}
                <div className='exp-field-title-container exp-with-mt-24'>
                    <span className='exp-field-title'>
                        {"사람 태그"}
                    </span>
                </div>
                <div
                    className='exp-friend-container exp-with-mt-12'
                    onClick={() => {
                        if (fixedExpInfo['creator'] != myId) {
                            toastText(`관리자(${findUserInfoById(fixedExpInfo['creator'])['user_name']})만 수정할 수 있어요.`);
                        } else {
                            if (!isInvitationLoading) {
                                setIsUserSearchOpen(true);
                            }
                        }
                    }}
                >
                    <img
                        src={majorEdit}
                        alt="검색"
                    />
                    {
                        (acceptedUserList.length === 0) &&
                        <div className='exp-friend-message-container'>
                            <span className='exp-friend-message exp-with-ml-8 exp-with-mb-12-5'>
                                {"경험을 함께한 사람을 태그하세요."}
                            </span>
                        </div>
                    }
                    {
                        (acceptedUserList.length > 0) &&
                        <div className='exp-element-container'>
                            {
                                acceptedUserList.map((peopleInfo) => (
                                    <div
                                        key={peopleInfo.id + (acceptedUserList.length)}
                                        className={"exp-element addProject-with-ml-8"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        {peopleInfo['user_name']}
                                        <button
                                            className="exp-remove-element"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (fixedExpInfo['creator'] != myId) {
                                                    toastText(`관리자(${findUserInfoById(fixedExpInfo['creator'])['user_name']})만 수정할 수 있어요.`);
                                                } else {
                                                    removePeopleById(peopleInfo['id']);
                                                }
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M1.5 8.5L8.5 1.5M8.5 8.5L1.5 1.5" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    }
                </div>
                {/** 사람 태그 카드 */}
                {
                    isUserSearchOpen &&
                    <PeopleTagPopUp
                        isPopUpOpen={isUserSearchOpen}
                        setIsPopUpOpen={setIsUserSearchOpen}
                        selectedPeopleList={currentInvitationList}
                        setSelectedPeopleList={setCurrentInvitationList}
                        maxSelectNum={20}
                        myId={myId}
                        filterFunc={(data) => {
                            if ((acceptedUserList.find(obj => obj.id == data['id'])) != null) {
                                return false;
                            }
                            if ((deleteTargetUserList.find(tempId => tempId == data['id'])) != null) {
                                return false;
                            }
                            if (
                                ((pendingInvitationList.find(obj => (obj['invitee'] == data['id']))) != null)
                                && (pendingInvitationList.find(obj => {
                                    return (
                                        (obj['invitee'] == data['id']) &&
                                        (obj['status'] == "pending")
                                    );
                                }) != null)
                            ) {
                                return false;
                            }
                            return true;
                        }}
                        confirmCallback={invitePeople}
                    />
                }
                {/** Pending members */}
                <div
                    className='exp-pending-container'
                >
                    {
                        (pendingInvitationList
                            .filter(obj => (obj['status'] === 'pending') || (obj['status'] === 'rejected').length > 0) &&
                            pendingInvitationList
                                .filter(obj => (obj['status'] === 'pending') || (obj['status'] === 'rejected').length > 0))
                            .map(pendingInfo => {
                                if (pendingInfo['status'] === "pending") {
                                    return (
                                        <div
                                            key={pendingInfo['id']}
                                            className='exp-pending-item'
                                        >
                                            <span
                                                className='exp-pending-item-message'
                                            >
                                                <strong>
                                                    {findUserInfoById(pendingInfo['invitee'])['user_name']}
                                                </strong>
                                                {"님의 수락을 기다리고 있습니다."}
                                            </span>
                                            <button
                                                className="exp-remove-element"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (fixedExpInfo['creator'] != myId) {
                                                        toastText(`관리자(${findUserInfoById(fixedExpInfo['creator'])['user_name']})만 수정할 수 있어요.`);
                                                    } else {
                                                        removeInvitation(pendingInfo['invitee']);
                                                    }
                                                }}
                                                style={{
                                                    marginLeft: 'auto'
                                                }}
                                            >
                                                {"초대 취소하기"}
                                            </button>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={pendingInfo['id']}
                                            className='exp-pending-item'
                                        >
                                            <span
                                                className='exp-pending-item-message'
                                            >
                                                <strong>
                                                    {findUserInfoById(pendingInfo['invitee'])['user_name']}
                                                </strong>
                                                {"님이 초대를 거절했습니다."}
                                            </span>
                                        </div>
                                    );
                                }
                            })
                    }
                </div>
                {/** Keyword */}
                <div className='exp-field-title-container exp-with-mt-24'>
                    <span className='exp-field-title'>
                        {"키워드"}
                    </span>
                    {
                        (fixedExpInfo['creator'] == myId) &&
                        <>
                            <span className='exp-field-title-star'>
                                {"*"}
                            </span>
                            <span className='exp-field-subtitle'>
                                {"최소 1개, 최대 5개"}
                            </span>
                        </>
                    }
                    {
                        (fixedExpInfo['creator'] != myId) &&
                        <span className='exp-field-subtitle'>
                            {"최대 5개"}
                        </span>
                    }
                </div>
                <div className='exp-contact-container exp-with-mt-12'>
                    <ItemEditor
                        type={"tag"}
                        currentItemList={newDetail['tags']}
                        setCurrentItemList={async (value) => await updateHelper('tags', value)}
                        placeholderMsg={"경험과 연관된 키워드를 입력해주세요."}
                        maxItemNum={5}
                        preventValueDuplication={true}
                        duplicatedValueMsg={"이미 추가한 키워드입니다."}
                    />
                </div>
                {/** Date */}
                <div className='exp-field-title-container exp-with-mt-24'>
                    <span className='exp-field-title'>
                        {"기간"}
                    </span>
                </div>
                <input
                    className='exp-field-input exp-with-mt-12'
                    placeholder='프로젝트에 참여한 기간을 작성해보세요.'
                    value={
                        ((newDetail['start_date'] != null) && (newDetail['end_date'] != null)) ?
                            `${newDetail['start_date'].replaceAll('-', '.')} - ${newDetail['end_date'].replaceAll('-', '.')}`
                            :
                            ""
                    }
                    readOnly
                    onClick={() => {
                        setIsDatePickerOpen(true);
                    }}
                />
                {/** date picker */}
                <DatePicker
                    isOpen={isDatePickerOpen}
                    setIsOpen={setIsDatePickerOpen}
                    startDate={newDetail['start_date']}
                    endDate={newDetail['end_date']}
                    setStartDate={async (value) => updateHelper('start_date', value)}
                    setEndDate={async (value) => updateHelper('end_date', value)}
                />
                {/** Skills */}
                <div className='exp-field-title-container exp-with-mt-24'>
                    <span className='exp-field-title'>
                        {"사용한 스킬"}
                    </span>
                </div>
                <div className='exp-contact-container exp-with-mt-12'>
                    <ItemEditor
                        type={"string"}
                        currentItemList={newDetail['skills_used']}
                        setCurrentItemList={async (value) => updateHelper('skills_used', value)}
                        placeholderMsg={"본인이 사용한 스킬을 추가해보세요."}
                        maxItemNum={999}
                        preventValueDuplication={true}
                        duplicatedValueMsg={"이미 추가한 스킬입니다."}
                    />
                </div>
                {/** Content */}
                <div className='exp-field-title-container exp-with-mt-24'>
                    <span className='exp-field-title'>
                        {"내용"}
                    </span>
                    {
                        (fixedExpInfo['creator'] == myId) &&
                        <span className='exp-field-title-star'>
                            {"*"}
                        </span>
                    }
                </div>
                <div className='exp-textarea-container exp-with-mt-12'>
                    <textarea
                        className='exp-textarea'
                        placeholder={"프로젝트와 관련된 내용을 자유롭게 작성해 보세요."}
                        value={newDetail["description"]}
                        onChange={async (e) => await updateHelper("description", e.target.value)}
                    />
                </div>
                {/** save button */}
                <button
                    id="savebtn"
                    className={
                        'exp-save-button'
                        + ((isValid && (isDetailChanged || isTitleChanged || isInvitationChanged)) ? '' : ' exp-btn-disabled')
                    }
                    onClick={async () => {
                        if (isValid && (isDetailChanged || isTitleChanged || isInvitationChanged) && (!isSaveLoading)) {
                            await saveExpAndExpInfo();
                        }
                    }}
                >
                    {
                        (!isSaveLoading) &&
                        <>{"저장"}</>
                    }
                    {
                        isSaveLoading &&
                        <div
                            className="exp-button-loader"
                            style={{
                                display: 'inline-block'
                            }}
                        />
                    }
                </button>
            </div>
        );
    }
};

export default EditExperience;