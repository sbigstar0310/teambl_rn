import React from 'react';
import "../../styles/Project/ProjectViewProfileAndMenu.css";
import SuspenseBox from '../SuspenseBox';

const ProjectResultViewAuthorInfo = ({isLoading, isRelationLoading, isOwner, data, relationshipDegree}) => {
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

    return (
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
                <span className='projectView-ProfileMenu-name mr-2'>
                            {data?.user?.profile?.user_name}
                        </span>
            }
            {
                (!isLoading) && (!isRelationLoading) && (!isOwner) &&
                <span className='projectView-ProfileMenu-relation'>
                            {(relationshipDegree ? `${relationshipDegree}촌` : "4촌 이상") + ` ・ `}
                        </span>
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
    );
};

export default ProjectResultViewAuthorInfo;