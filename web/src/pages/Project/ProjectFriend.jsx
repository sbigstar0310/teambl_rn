import React, { useEffect, useState } from 'react';
import "../../styles/Project/ProjectFriend.css";
import { useParams } from 'react-router-dom';
import api from '../../api';
import backIcon from "../../assets/ProfileOther/left-arrow.svg";
import FriendOtherItem from '../../components/FriendOtherItem';

const ProjectFriend = () => {
    const { projectId } = useParams();
    const currentUserId = localStorage.getItem("userId");

    /** loading, onerr states */
    const [isLoading, setIsLoading] = useState(true);
    const [isOnError, setIsOnError] = useState(false);

    /** data */
    const [projectFriendList, setProjectFriendList] = useState([]);

    /** data fetch */
    const fetchProjectFriendList = async () => {
        await setIsLoading(true);
        await setIsOnError(false);
        try {
            const res = await api.get(`/api/projects/${projectId}/tagged-users/`);
            await setProjectFriendList(res.data);
        } catch (e) {
            await setIsOnError(true);
            console.log(e);
        } finally {
            await setIsLoading(false);
        }
    };

    /** effects */
    useEffect(() => {
        fetchProjectFriendList();
    }, [projectId]);

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
                            onClick={() => window.history.back()}
                        >
                            <img src={backIcon} />
                        </button>
                    </div>
                </div>
                <div className="projectFriend-error-container">
                    {"일촌 정보를 불러오는 데 실패했습니다."}
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
                            onClick={() => window.history.back()}
                        >
                            <img src={backIcon} />
                        </button>
                        <span className="projectFriend-title margin-left-15px">
                            {`함께하는 멤버`}
                        </span>
                    </div>
                    {/** Number of friends */}
                    <div className="projectFriend-friend-number-container">
                        <span className="projectFriend-friend-number">
                            {`${projectFriendList.length}명`}
                        </span>
                    </div>
                </div>
                {/** actual list view */}
                <div className="projectFriend-item-container">
                    {
                        projectFriendList.map((friendInfo) => {
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
            </div>
        </div>
    );
};

export default ProjectFriend;