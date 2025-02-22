import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import backIcon from "../../assets/Profile/left-arrow.svg";
import "../../styles/Experience/Experience.css";
import {toastText} from '../../components/Toast/Toast';
import retrieveProjectCardInvitationLinkFromCode
    from "../../libs/apis/ProjectCardInvitationLink/retreiveProjectCardInvitationLinkFromCode.js";
import projectCardInvitationResponse from "../../libs/apis/ProjectCardInvitation/projectCardInvitationResponse.js";

/** When accessing by the invitation link, but already signed in. */
const ExperienceInvitation = ({invitationCode}) => {
    const myId = parseInt(localStorage.getItem("userId"));
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(true);
    const [isOnError, setIsOnError] = useState(false);
    const [isAlreadyIn, setIsAlreadyIn] = useState(null);
    const [isAcceptLoading, setIsAcceptLoading] = useState(false);

    const [invInfo, setInvInfo] = useState({});

    /** get the invitation information and check already in. */
    const fetchExpInfoAndCheck = async () => {
        await setIsLoading(true);
        await setIsOnError(false);

        try {
            const invitationData = await retrieveProjectCardInvitationLinkFromCode(invitationCode);
            await setInvInfo(invitationData);
            /** check owner */
            if (invitationData['project_card']['creator'].id == myId) {
                toastText("내가 생성한 프로젝트 카드이에요.");
                navigate(`/profile/${myId}`, {
                    state: {
                        ...location.state,
                        tempTargetExpId: invitationData['project_card']['id'],
                        AddExp: true
                    }
                });
            }
            /** check already in */
            let memberIdList = invitationData.project_card['accepted_users'];
            invitationData.project_card['pending_invitations']?.forEach(elem => {
                if (!memberIdList.includes(elem['invitee_id'])) {
                    if (elem['status'] === 'accepted') {
                        memberIdList.push(elem['invitee_id']);
                    }
                }
            });
            await setIsAlreadyIn(memberIdList.includes(myId));
        } catch (e) {
            console.log(e);
            await setIsOnError(true);
        } finally {
            await setIsLoading(false);
        }
    };

    const handleAccept = async () => {
        if (isAcceptLoading) {
            return;
        } else {
            await setIsAcceptLoading(true);
            try {
                await projectCardInvitationResponse(invitationCode, "accepted");
                navigate(`/profile/${myId}`, {
                    state: {
                        ...location.state,
                        tempTargetExpId: invInfo['project_card']['id'],
                        AddExp: true
                    }
                });
            } catch (e) {
                console.log(e);
                toastText("수락에 실패했어요.");
            } finally {
                await setIsAcceptLoading(false);
            }
        }
    };

    const handleRefuse = async () => {
        if (isAcceptLoading) {
            return;
        } else {
            await setIsAcceptLoading(true);
            try {
                await projectCardInvitationResponse(invitationCode, "rejected");
                navigate("/home");
            } catch (e) {
                console.log(e);
                toastText("거부하지 못했습니다.");
            } finally {
                await setIsAcceptLoading(false);
            }
        }
    }

    /** utils */

    /** add "조사" */
    const appendChosa = (text) => {
        const isHangul = (char) => /[가-힣]/.test(char);
        const isEnglish = (char) => /[a-zA-Z]/.test(char);
        const charCode = text.charCodeAt(text.length - 1);

        if (isHangul(text[text.length - 1])) {
            const consonantCode = (charCode - 44032) % 28;
            return consonantCode === 0 ? `를` : `을`;
        } else if (isEnglish(text[text.length - 1])) {
            const consonantsWithBatchim = ['b', 'c', 'd', 'g', 'k', 'l', 'm', 'n', 'p', 'q', 't'];
            const lastChar = text[text.length - 1].toLowerCase();
            const secondLastChar = text.length > 1 ? text[text.length - 2].toLowerCase() : '';

            if (text.length > 1 && secondLastChar === 'l' && lastChar === 'e') {
                return `을`;
            }

            return consonantsWithBatchim.includes(lastChar) ? `을` : `를`;
        }

        return `를`;
    };

    /** go back */
    const handleBack = () => {
        if (isAlreadyIn) {
            navigate(`/profile/${myId}`, {
                state: {
                    ...location.state,
                    tempTargetExpId: invInfo['experience']['id'],
                    AddExp: true
                }
            });
            return;
        }

        /** go home */
        navigate('/home');
    };

    /** effects */
    useEffect(() => {
        fetchExpInfoAndCheck();
        /** if states exists, delete */
        if ((location.state != null) && location.state.isExpProcess) {
            navigate(location.pathname, {
                state: {
                    ...location.state,
                    isExpProcess: null,
                    expInvitationCode: null
                }
            });
        }
    }, [invitationCode]);

    if (isLoading || (isAlreadyIn == null)) {
        return (
            <div className="exp-loader-container">
                <div className="exp-loader"/>
            </div>
        );
    }

    if (isOnError) {
        return (
            <div className="exp-body exp-with-pd-28">
                <div className="exp-container">
                    {/** Backward button */}
                    <div className="exp-backward-btn-container">
                        <button
                            className="exp-backbutton"
                            onClick={() => handleBack()}
                        >
                            <img src={backIcon}/>
                        </button>
                    </div>
                </div>
                <div className="exp-error-container">
                    {"초대 정보를 불러오는 데 실패했습니다."}
                </div>
            </div>
        );
    }

    if (isAlreadyIn) {
        return (
            <div className="exp-body exp-with-pd-28">
                <div className="exp-container">
                    {/** Backward button */}
                    <div className="exp-backward-btn-container">
                        <button
                            className="exp-backbutton"
                            onClick={() => handleBack()}
                        >
                            <img src={backIcon}/>
                        </button>
                    </div>
                </div>
                <div
                    className="exp-error-container"
                    style={{
                        marginTop: '20px'
                    }}
                >
                    {`이미 ${invInfo['inviter']['profile']['user_name']}님과의 ‘${invInfo['project_card']['title']}’ 프로젝트을 함께하고 있어요.`}
                </div>
                <div
                    className="exp-error-container"
                >
                    <button
                        className='exp-save-button'
                        onClick={() => {
                            navigate(`/profile/${myId}`, {
                                state: {
                                    ...location.state,
                                    tempTargetExpId: invInfo['project_card']['id'],
                                    AddExp: true
                                }
                            });
                        }}
                    >
                        {"프로젝트 확인하기"}
                    </button>
                </div>
            </div>
        );
    }

    /** new member */
    return (
        <div className="exp-body exp-with-pd-28">
            <div className="exp-container">
                {/** Backward button */}
                <div className="exp-backward-btn-container">
                    <button
                        className="exp-backbutton"
                        onClick={() => handleBack()}
                    >
                        <img src={backIcon}/>
                    </button>
                </div>
            </div>
            {/** title */}
            <div
                className='exp-inv-title-container'
            >
                <div className='exp-inv-title-row'>
                    <span className='exp-inv-title primary-color'>
                        {`${invInfo['inviter']['profile']['user_name']}`}
                    </span>
                    <span className='exp-inv-title'>
                        {`님이 당신과 함께한`}
                    </span>
                </div>
                <div className='exp-inv-title-row'>
                    <span className='exp-inv-title primary-color'>
                        {`‘${invInfo['project_card']['title']}’`}
                    </span>
                    <span className='exp-inv-title'>
                        {`${appendChosa(invInfo['project_card']['title'])} 공유하려 합니다.`}
                    </span>
                </div>
            </div>
            {/** sub-title */}
            <div className='exp-inv-subtitle-container'>
                <span className='exp-inv-subtitle'>
                    {"초대를 수락하시겠어요?"}
                </span>
            </div>
            {/** caption */}
            <div className='exp-inv-caption-container'>
                <span className='exp-inv-caption'>
                    {"초대를 수락하면 프로젝트을 함께하는 사람에 추가되고, 내 프로젝트 카드에서도 확인할 수 있어요."}
                </span>
            </div>
            {/** buttons */}
            <div className='exp-inv-bottom-button-container'>
                <button
                    className='exp-save-button no-mg'
                    onClick={async () => await handleAccept()}
                >
                    {
                        isAcceptLoading ?
                            <div
                                className="exp-button-loader"
                                style={{
                                    display: 'inline-block'
                                }}
                            />
                            :
                            "수락하기"
                    }
                </button>
                <button
                    className='exp-save-button no-mg exp-btn-disabled'
                    onClick={handleRefuse}
                >
                    {
                        isAcceptLoading ?
                            <div
                                className="exp-button-loader"
                                style={{
                                    display: 'inline-block'
                                }}
                            />
                            :
                            "거절하기"
                    }
                </button>
            </div>
        </div>
    );
};

export default ExperienceInvitation;