import React, { useEffect, useRef, useState } from 'react';
import "../../styles/Experience/Experience.css";
import SuspenseBox from '../SuspenseBox';
import api from '../../api';
import { useLocation, useNavigate } from 'react-router-dom';
import ExperienceCard from './ExperienceCard';

const ExperienceView = ({ userId, setCount, updateTrigger }) => {

    const navigate = useNavigate();
    const myId = localStorage.getItem("userId");
    const location = useLocation();

    /** meta */
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    /** data */
    const [guestExperienceList, setGuestExperienceList] = useState([]);
    const [invitedExperienceList, setInvitedExperienceList] = useState([]);

    /** ------- For auto scroll ------- */
    const [tempTargetExpId, setTempTargetExpId] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        setTempTargetExpId(location.state?.tempTargetExpId);
    }, [location]);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollAutoWrapper();
        }, 200);
    
        return () => {
            clearTimeout(timer);
        };
    }, [tempTargetExpId]);

    useEffect(() => {
        if (updateTrigger != null) {
            fetchExperienceList();
        }
    }, [updateTrigger])

    const scrollAutoWrapper = () => {
        if (tempTargetExpId) {
            let targetItem = document.getElementById(tempTargetExpId);
            if (targetItem) {
                scrollAuto(targetItem);
            }
        }
    };

    const scrollAuto = (el) => {
        if (tempTargetExpId) {
            const container = containerRef.current;
            const targetItem = el;

            if (container && targetItem) {
                container.scrollTo({
                    left: targetItem.offsetLeft,
                    behavior: "smooth",
                });
                navigate(location.pathname, { state: { ...location.state, tempTargetExpId: null } });
            }
        }
    };

    /** ------- For auto scroll ------- */

    /** fetch experience list */
    const fetchExperienceList = async () => {
        await setIsLoading(true);
        await setIsError(false);
        try {
            const res = await api.get(`/api/experiences-with-pending/${userId}/`);
            let newExpList = res.data;
            let tempGuestExpList = [];
            let tempInvitedExpList = [];
            newExpList.forEach(expItem => {
                if (expItem['accepted_users'].includes(parseInt(userId))) {
                    /** guest */
                    tempGuestExpList.push({ ...expItem });
                } else {
                    /** newly invited */
                    /** pending_invitations */
                    tempInvitedExpList.push({ ...expItem });
                }
            });
            if (setCount) {
                setCount(tempGuestExpList.length);
            }
            await setGuestExperienceList(tempGuestExpList);
            await setInvitedExperienceList(tempInvitedExpList);
        } catch (e) {
            console.log(e);
            await setIsError(true);
        } finally {
            await setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExperienceList();
    }, [userId]);

    /** empty */
    if ((userId != myId) && (guestExperienceList.length === 0)) {
        return (<></>);
    }

    /** just suspense boxes */
    if (isLoading) {
        return (
            <div
                className='exp-view-container'
            >
                <div
                    className='exp-view-item-container'
                    style={{
                        height: '320px',
                        padding: '16px',
                        boxSizing: 'border-box',
                        borderRadius: '5px',
                        border: '1.2px solid var(--04, #D9D9D9)'
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <SuspenseBox
                            styleOv={{
                                width: '103px',
                                height: '24px',
                                display: 'inline-block'
                            }}
                        />
                    </div>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            marginTop: '10px'
                        }}
                    >
                        <SuspenseBox
                            styleOv={{
                                width: '55px',
                                height: '14px',
                                marginRight: '14px',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '20px',
                                height: '20px',
                                marginRight: '3px',
                                borderRadius: '50%',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '76px',
                                height: '14px',
                                marginRight: 'auto',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '89px',
                                height: '14px',
                                display: 'inline-block'
                            }}
                        />
                    </div>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            marginTop: '11px',
                            gap: '8px'
                        }}
                    >
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px',
                                display: 'inline-block'
                            }}
                        />
                    </div>
                    <SuspenseBox
                        styleOv={{
                            width: '100%',
                            height: '176px',
                            marginTop: '24px'
                        }}
                    />
                </div>
            </div>
        );
    };

    if (isError) {
        return (
            <div className='exp-view-container'>
                <div className='exp-view-item-container'>
                    <div className='exp-view-no-exp-container'>
                        <span
                            className="exp-view-exp-message"
                        >
                            {"경험 정보를 불러오는 데 실패했어요."}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className='exp-view-container'
            ref={containerRef}
        >
            {/** invited! */}
            {
                invitedExperienceList &&
                (userId == myId) &&
                invitedExperienceList.map(expInfo => {
                    return (
                        <ExperienceCard
                            id={expInfo.id}
                            myId={myId}
                            key={expInfo.id}
                            userId={userId}
                            expInfo={expInfo}
                            type={"INVITED"}
                            updateCardList={fetchExperienceList}
                            onLoad={(e) => scrollAuto(e.targetItem)}
                        />
                    );
                })
            }
            {/** normal (owner + guest) */}
            {
                guestExperienceList &&
                guestExperienceList.map(expInfo => {
                    return (
                        <ExperienceCard
                            id={expInfo.id}
                            myId={myId}
                            key={expInfo.id}
                            userId={userId}
                            expInfo={expInfo}
                            type={"GUEST"}
                            updateCardList={fetchExperienceList}
                            onLoad={(e) => scrollAuto(e.targetItem)}
                        />
                    );
                })
            }
            {/** for the last element, add interface */}
            {
                (userId == myId) && (!isLoading) &&
                <div
                    className='exp-view-item-container-wrapper'
                    style={{
                        padding: '0',
                        border: 'none'
                    }}
                >
                    <div
                        className='exp-view-item-container'
                        style={{
                            height: '100%'
                        }}
                    >
                        <div className='exp-view-no-exp-container'>
                            <button
                                className="exp-view-exp-add-button"
                                onClick={() => navigate('/experience/add')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <path d="M11 1V21" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M21 11L1 11" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <span
                                className="exp-view-exp-message"
                            >
                                {"경험 추가하기"}
                            </span>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default ExperienceView;