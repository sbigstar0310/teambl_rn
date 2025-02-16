import "../../styles/Project/ProjectViewContent.css";
import "../../styles/Project/ProjectViewBottomInfo.css";
import SuspenseBox from "../SuspenseBox.jsx";
import FilledLike from "../../assets/NewProject/FilledHeart.svg";
import EmptyLike from "../../assets/NewProject/Heart.svg";
import CommentIcon from "../../assets/NewProject/CommentCircle.svg";
import React, {useEffect, useState} from "react";
import api from "../../api.js";

const ProjectResultViewHeader = ({isLoading, projectData, projectId, onCommentSectionToggle}) => {
    const [isOnError, setIsOnError] = useState(false);
    const [isAdditionalLoading, setIsAdditionalLoading] = useState(true);
    const [isLikeToggleLoading, setIsLikeToggleLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);

    const updateIsLiked = async () => {
        try {
            const res = await api.get(`/api/projects/${projectId}/liked-status/`);
            await setIsLiked(res.data.liked);
        } catch (e) {
            console.log(e);
            await setIsLiked(false);
            await setIsOnError(true);
        }
    };
    const updateLikeCount = async () => {
        /** 이후 해당 프로젝트의 데이터만 수신하는 구조로 변경해야 할 듯함 */
        try {
            /** get project list */
            const res = await api.get("/api/projects/every/");
            /** extract the target */
            let projectList = res.data;
            let index = -1;
            for (let i = 0; i < projectList.length; i++) {
                if (projectList[i]["project_id"] === projectId) {
                    index = i;
                }
            }
            if (index === -1) {
                throw new Error("Failed to get project information");
            }
            const newProjectInfo = {...projectList[index]};
            await setLikeCount(newProjectInfo["like_count"]);
        } catch (e) {
            await setLikeCount(0);
            await setIsOnError(true);
            console.log(e);
        }
    };
    const updateComment = async () => {
        try {
            const res = await api.get(`/api/projects/${projectId}/comments/`);
            await setCommentCount(res.data.length);
        } catch (e) {
            console.log(e);
            await setCommentCount(0);
            await setIsOnError(true);
        }
    };
    const fetchAdditionalInfo = async () => {
        await setIsAdditionalLoading(true);
        await setIsOnError(false);

        await updateIsLiked();
        await updateLikeCount();
        await updateComment();

        await setIsAdditionalLoading(false);
    };

    const toggleLike = async () => {
        if (isLikeToggleLoading) {
            return;
        }
        await setIsLikeToggleLoading(true);
        try {
            await api.post(`/api/projects/${projectId}/like-toggle/`);
            await updateIsLiked();
            await updateLikeCount();
        } catch (e) {
            console.log(e);
            await setIsOnError(true);
        } finally {
            await setIsLikeToggleLoading(false);
        }
    };

    useEffect(() => {
        if (projectId != null) {
            fetchAdditionalInfo();
        }
    }, [projectId]);

    /** loader */
    if (isLoading || isAdditionalLoading) {
        return (
            <div className="flex">
                <SuspenseBox
                    styleOv={{
                        height: "17px",
                        width: "84px",
                    }}
                />
                <SuspenseBox
                    styleOv={{
                        marginLeft: "auto",
                        height: "21px",
                        width: "21px",
                        borderRadius: "50%",
                    }}
                />
                <SuspenseBox
                    styleOv={{
                        marginLeft: "2px",
                        height: "17px",
                        width: "17px",
                    }}
                />
                <SuspenseBox
                    styleOv={{
                        marginLeft: "12px",
                        height: "20px",
                        width: "20px",
                        borderRadius: "50%",
                    }}
                />
                <SuspenseBox
                    styleOv={{
                        marginLeft: "2px",
                        height: "17px",
                        width: "17px",
                    }}
                />
            </div>
        );
    }

    if (isOnError) {
        return (
            <div className="text-center">
          <span className="projectView-bottomInfo-member-title">
            {"정보 수신에 실패했습니다."}
          </span>
            </div>
        );
    }

    return (
        <div className="flex">
            {/** title */}
            <div className='projectView-content-title-container'>
                {
                    isLoading &&
                    <SuspenseBox
                        styleOv={{
                            width: '105px',
                            height: '19px'
                        }}
                    />
                }
                {
                    (!isLoading) &&
                    <span className='projectView-content-title'>
                        {projectData?.title}
                    </span>
                }
            </div>
            {/** likes & comments */}
            <div className='projectView-bottomInfo-like-comment-container'>
                {/** likes */}
                <button
                    className='projectView-bottomInfo-button'
                    onClick={async () => await toggleLike()}
                >
                    {
                        isLiked ?
                            <img src={FilledLike}/>
                            :
                            <img src={EmptyLike}/>
                    }
                </button>
                <div
                    className='projectView-bottomInfo-count'
                    onClick={() => {
                        if (likeCount > 0) {
                            navigate(`/projects/${projectId}/liked`);
                        }
                    }}
                >
                    {(likeCount > 100) ? "99+" : likeCount}
                </div>
                {/** comments */}
                <button
                    className='projectView-bottomInfo-button projectView-bottomInfo-ml-10'
                    onClick={() => {
                        if (!isLoading) {
                            onCommentSectionToggle();
                        }
                    }}
                >
                    <img src={CommentIcon}/>
                </button>
                <div
                    className='projectView-bottomInfo-count'
                    onClick={() => {
                        if (!isLoading) {
                            onCommentSectionToggle();
                        }
                    }}
                >
                    {commentCount}
                </div>
            </div>
        </div>
    )
}

export default ProjectResultViewHeader;