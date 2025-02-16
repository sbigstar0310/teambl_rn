import React, { useEffect, useState } from 'react';
import "../../styles/Project/ProjectFriend.css";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import backIcon from "../../assets/ProfileOther/left-arrow.svg";
import FriendOtherItem from '../../components/FriendOtherItem';

const ExperienceMember = () => {

    const { expId, userId } = useParams();
    const myId = localStorage.getItem("userId");

    const location = useLocation();
    const navigate = useNavigate();

    /** states */
    const [isLoading, setIsLoading] = useState(true);
    const [isOnError, setIsOnError] = useState(false);
    const [myProfile, setMyProfile] = useState(null);
    const [memberList, setMemberList] = useState([]);
    const [pendingList, setPendingList] = useState([]);

    /** handler */
    const handleBack = async () => {
        // if (location.state.fromProfileId != null) {
        //     let targetId = location.state.fromProfileId;
        //     await navigate(location.pathname, {
        //         state: {
        //             ...location.state,
        //             "fromProfileId": null
        //         }
        //     });
        //     navigate(`/profile/${targetId}`, {
        //         state: {
        //             ...location.state,
        //             tempTargetExpId: expId,
        //             AddExp: true,
        //             preventComeBack: true
        //         }
        //     });
        // } else {
        //     window.history.back();
        // }
        window.history.back();
    };

    /** data fetch */
    const fetchMemberList = async () => {
        await setIsLoading(true);
        await setIsOnError(false);
        try {
            const res = await api.get(`/api/experiences-with-pending/${userId}/`);
            let newExpList = res.data;

            let targetExpInfo = {};
            let newMemberIdList = [];
            let isFound = false;
            newExpList.forEach(expInfo => {
                if (expInfo['id'] == expId) {
                    newMemberIdList = [...expInfo['accepted_users']];
                    targetExpInfo = { ...expInfo };
                    isFound = true;
                }
            });

            if (!isFound) {
                throw new Error("The given experience does NOT exist for the user.");
            }

            let newPendingIdList = [];
            targetExpInfo['pending_invitations']?.forEach(invitation => {
                if (invitation['status'] === 'pending') {
                    newPendingIdList.push(invitation['invitee']);
                }
            });

            /** get each member info */
            const tempMemberInfoList = await Promise.all(newMemberIdList.map(async (targetUserId) => {
                try {
                    const res = await api.get(`/api/user/${targetUserId}/`);
                    return { ...res.data };
                } catch (e) {
                    console.log(e);
                    return {
                        'id': targetUserId,
                        'user_name': '알 수 없는 사용자'
                    };
                }
            }));

            const tempPendingInfoList = await Promise.all(newPendingIdList.map(async (targetUserId) => {
                try {
                    const res = await api.get(`/api/user/${targetUserId}/`);
                    return { ...res.data };
                } catch (e) {
                    console.log(e);
                    return {
                        'id': targetUserId,
                        'user_name': '알 수 없는 사용자'
                    };
                }
            }));

            /** extract ME */
            let index = -1;
            for (let i = 0; i < tempMemberInfoList.length; i++) {
                if (tempMemberInfoList[i]['id'] == myId) {
                    index = i;
                    await setMyProfile({ ...tempMemberInfoList[i], 'isAccepted': true });
                }
            }
            if (index !== -1) {
                tempMemberInfoList.splice(index, 1);
            }

            let index2 = -1;
            for (let i = 0; i < tempPendingInfoList.length; i++) {
                if (tempPendingInfoList[i]['id'] == myId) {
                    index2 = i;
                    await setMyProfile({ ...tempPendingInfoList[i], 'isAccepted': false });
                }
            }
            if (index2 !== -1) {
                tempPendingInfoList.splice(index2, 1);
            }

            await setMemberList(tempMemberInfoList);
            await setPendingList(tempPendingInfoList);
        } catch (e) {
            await setIsOnError(true);
            console.log(e);
        } finally {
            await setIsLoading(false);
        }
    };

    /** effects */
    useEffect(() => {
        fetchMemberList();
    }, [expId]);

    /** loading */
    if (isLoading) {
        return (
            <div className="projectFriend-loader-container">
                <div className="projectFriend-loader" />
            </div>
        );
    }

    /** error */
    if (isOnError) {
        return (
            <div className="projectFriend-body">
                <div className="projectFriend-container">
                    {/** Backward button and Title */}
                    <div className="projectFriend-title-container">
                        <button
                            className="projectFriend-backbutton"
                            onClick={async () => await handleBack()}
                        >
                            <img src={backIcon} />
                        </button>
                    </div>
                </div>
                <div className="projectFriend-error-container">
                    {"경험을 함께하는 사람을 불러오는 데 실패했습니다."}
                </div>
            </div>
        );
    }

    return (
        <div className="projectFriend-body">
            <div className="projectFriend-container">
                {/** top fixed area */}
                <div className="projectFriend-toparea-container top-sticky top-0px">
                    {/** Backward button and Title */}
                    <div className="projectFriend-title-container">
                        <button
                            className="projectFriend-backbutton"
                            onClick={async () => await handleBack()}
                        >
                            <img src={backIcon} />
                        </button>
                        <span className="projectFriend-title margin-left-15px">
                            {`경험을 함께하는 사람들`}
                        </span>
                    </div>
                    {/** Number of friends */}
                    <div className="projectFriend-friend-number-container">
                        <span className="projectFriend-friend-number">
                            {`${memberList.length + pendingList.length + (myProfile ? 1 : 0)}명`}
                        </span>
                    </div>
                </div>
                {/** actual list view */}
                <div className="projectFriend-item-container">
                    {/** me */}
                    {
                        myProfile &&
                        <FriendOtherItem
                            key={myProfile["id"]}
                            id={myProfile["id"]}
                            friendInfo={myProfile.profile}
                            isLock={!myProfile['isAccepted']}
                            lockMessage={"초대 수락을 기다리는 중입니다."}
                        />
                    }
                    {
                        memberList.map((friendInfo) => {
                            return (
                                <FriendOtherItem
                                    key={friendInfo["id"]}
                                    id={friendInfo["id"]}
                                    friendInfo={friendInfo.profile}
                                />
                            );
                        })
                    }
                </div>
                {/** pending list view */}
                <div className="projectFriend-item-container">
                    {
                        pendingList.map((friendInfo) => {
                            return (
                                <FriendOtherItem
                                    key={friendInfo["id"]}
                                    id={friendInfo["id"]}
                                    friendInfo={friendInfo.profile}
                                    isLock={true}
                                    lockMessage={"초대 수락을 기다리는 중입니다."}
                                />
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
};

export default ExperienceMember;