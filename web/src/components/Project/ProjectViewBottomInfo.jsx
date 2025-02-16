import React, { useEffect, useState } from "react";
import "../../styles/Project/ProjectViewBottomInfo.css";
import profileDefaultImg from "../../assets/default_profile_image.svg";
import EmptyLike from "../../assets/NewProject/Heart.svg";
import FilledLike from "../../assets/NewProject/FilledHeart.svg";
import CommentIcon from "../../assets/NewProject/CommentCircle.svg";
import SuspenseBox from "../SuspenseBox";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import ProjectViewComment from "./ProjectViewComment";

const ProjectViewBottomInfo = ({ isLoading, data, projectId }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

  const [isAdditionalLoading, setIsAdditionalLoading] = useState(true);
  const [isImageLoadedList, setIsImageLoadedList] = useState([
    false,
    false,
  ]); /** only two previews */
  const [isOnError, setIsOnError] = useState(false);
  const [isLikeToggleLoading, setIsLikeToggleLoading] = useState(false);

  const [friendList, setFriendList] = useState([]);
  const [profileImageList, setProfileImageList] = useState([]);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentList, setCommentList] = useState([]);

  const handleImageLoad = (index) => {
    setIsImageLoadedList((prevState) => {
      let newState = [...prevState];
      newState[index] = true;
      return newState;
    });
  };

  const checkImageLoaded = (imgElement, index) => {
    if (imgElement.complete) {
      setIsImageLoadedList((prevState) => {
        let newState = [...prevState];
        newState[index] = true;
        return newState;
      });
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
      const newProjectInfo = { ...projectList[index] };
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
      await setCommentList(res.data);
    } catch (e) {
      console.log(e);
      await setCommentList([]);
      await setIsOnError(true);
    }
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

  /** effects */
  useEffect(() => {
    let memberList = data?.tagged_users;
    if (typeof memberList === "undefined") {
      setFriendList([]);
      return;
    } else {
      setFriendList([...memberList]);
      const imageList = [];
      memberList.forEach((memberInfo) => {
        if (memberInfo.profile.image != null) {
          imageList.push(memberInfo.profile.image);
        } else {
          imageList.push(profileDefaultImg);
        }
      });
      setProfileImageList([...imageList]);
      imageList.forEach((imageUrl, index) => {
        const imgElement = new Image();
        imgElement.src = imageUrl;
        checkImageLoaded(imgElement, index);
      });
    }
  }, [data]);

  useEffect(() => {
    if (projectId != null) {
      fetchAdditionalInfo();
    }
  }, [projectId]);

  /** loader */
  if (isLoading || isAdditionalLoading) {
    return (
      <div className="projectView-bottomInfo-container">
        <SuspenseBox
          styleOv={{
            height: "17px",
            width: "84px",
          }}
        />
        <SuspenseBox
          styleOv={{
            marginLeft: "4px",
            height: "20px",
            width: "20px",
            borderRadius: "50%",
            zIndex: "1",
          }}
        />
        <SuspenseBox
          styleOv={{
            height: "21px",
            width: "21px",
            borderRadius: "50%",
            position: "relative",
            right: "10px",
            zIndex: "0",
          }}
        />
        <SuspenseBox
          styleOv={{
            position: "relative",
            right: "6px",
            height: "17px",
            width: "34px",
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
      <div className="projectView-bottomInfo-container">
        <div className="projectView-bottomInfo-member-container">
          <span className="projectView-bottomInfo-member-title">
            {"정보 수신에 실패했습니다."}
          </span>
        </div>
      </div>
    );
  }

    return (
        <>
        <div className='projectView-bottomInfo-container'>
            {/** members */}
            <div
              className='projectView-bottomInfo-member-container'
              onClick={() => {
                if (friendList.length > 0) {
                  navigate(`/projects/${projectId}/friends`);
                }
              }}    
            >
                <span
                  className='projectView-bottomInfo-member-title'
                >
                    {"함께하는 멤버 :"}
                </span>
                {
                    (friendList.length === 0) &&
                    <span className='projectView-bottomInfo-member-count projectView-bottomInfo-ml-4'>
                        {`0명`}
                    </span>
                }
                {
                    (friendList.length > 0) &&
                    profileImageList.map((imageUrl, index) => {
                        if (index > 1) {
                            /** only two preview */
                            return;
                        }
                        return (
                            <div
                                key={index + imageUrl}
                                style={{
                                    padding: '0',
                                    margin: '0',
                                    height: 'auto',
                                    width: 'auto'
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    onLoad={() => handleImageLoad(index)}
                                    className={`projectView-bottomInfo-member-image`
                                        + `${(index === 0) ? ' projectView-bottomInfo-ml-4' : ''}`
                                        + `${isImageLoadedList[index] ? "" : " projectView-bottomInfo-hidden"}`
                                        + ` projectView-bottomInfo-member-image${(index === 0) ? '-1st' : '-2nd'}`}
                                    onError={(e) => (e.target.src = profileDefaultImg)}
                                />
                                {
                                    !isImageLoadedList[index] &&
                                    <SuspenseBox
                                        styleOv={
                                            (index === 0) ?
                                            {
                                                display: 'inline-block',
                                                width: '21px',
                                                height: '21px',
                                                borderRadius: '50%',
                                                zIndex: '1'
                                            }
                                            :
                                            {
                                                display: 'inline-block',
                                                width: '21px',
                                                height: '21px',
                                                borderRadius: '50%',
                                                zIndex: '0',
                                                position: 'relative',
                                                right: '10px'
                                            }
                                        }
                                    />
                                }
                            </div>
                        );
                    })
                }
                {
                    friendList.length > 2 &&
                    <span
                        className='projectView-bottomInfo-member-count projectView-bottomInfo-ml-rev-6'  
                    >
                        {`외 ${friendList.length - 2}명`}
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
                        <img src={FilledLike} />
                        :
                        <img src={EmptyLike} />
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
                            setIsCommentSectionOpen(!isCommentSectionOpen);
                        }
                    }}
                >
                    <img src={CommentIcon} />
                </button>
                <div 
                    className='projectView-bottomInfo-count'
                    onClick={() => {
                        if (!isLoading) {
                            setIsCommentSectionOpen(!isCommentSectionOpen);
                        }
                    }}
                >
                    {commentList.length}
                </div>
            </div>
        </div>
        {/** comment detail */}
        {
            isCommentSectionOpen &&
            <ProjectViewComment
                isOpen={isCommentSectionOpen}
                commentList={commentList}
                updateCommentList={updateComment}
                projectId={projectId}
                userInfo={userId ? userId: {}}
            />
        }
        </>
    );
};

export default ProjectViewBottomInfo;
