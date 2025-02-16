import React, { useState, useEffect } from "react";
import "../styles/FriendOtherItem.css";
import ProfileDefaultImg from "../assets/default_profile_image.svg";
import { useNavigate } from "react-router-dom";
import InfoMessage from "./InfoMessage";
import api from "../api";

export default function FriendOtherItem({ id, friendInfo, isLock, lockMessage }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [relationshipDegree, setRelationshipDegree] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState({});

  // 현재 유저와 타겟 유저의 촌수를 가져오는 메소드
  const getRelationshipDegree = async (targetUserId) => {
    if(targetUserId){
      await setIsLoading(true);
      try {
        const response = await api.get(`/api/get-user-distance/${targetUserId}/`);
        const degree = response.data.distance;
        setRelationshipDegree(degree);
        getCurrentUserInfo();
      } catch (error) {
        console.log(error);
        await setIsLoading(false);
      }
    }
  };

  /** 현재 사용자의 정보를 가져오는 메소드 */
  const getCurrentUserInfo = async () => {
    try {
      const res = await api.get(`/api/current-user/`);
      await setCurrentUserInfo(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      await setIsLoading(false);
    }
  };

  useEffect(() => {
    getRelationshipDegree(id);
  }, [id]);

  return (
    <div
      className="friendOtherItem-container"
      onClick={() => {
        if (typeof isLock === "undefined") {
          navigate(`/profile/${id}`);
        } else {
          if (!isLock) {
            navigate(`/profile/${id}`);
          }
        }
      }}
    >
      {/** profile image */}
      <div className="friendOtherItem-profile-image-container">
        <img
          src={friendInfo?.image || ProfileDefaultImg}
          alt={friendInfo?.user_name}
          className="friendOtherItem-profile-image"
        />
      </div>
      {/** information : name, school, department */}
      <div className="friendOtherItem-info-container">
        <div className="friendOtherItem-name-relation-container">
          <span className={`friendOtherItem-name${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''}`}>{friendInfo.user_name}</span>
          {
            (!isLoading) && (!(id === currentUserInfo?.id))&&
            <span className={`friendOtherItem-relation${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''}`}>{` ・ ` + (relationshipDegree ? `${relationshipDegree}촌` : "4촌 이상")}</span>
          }
        </div>
        <div className={`friendOtherItem-basic-info-container`}>
          <span className={`friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''} right-margin-10px`}>
            {friendInfo.school}
          </span>
          <span className={`friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''} font-12px`}>{"|"}</span>
          <span className={`friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''} right-margin-10px left-margin-10px`}>
            {friendInfo.current_academic_degree}
          </span>
          <span className={`friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''} font-12px`}>{"|"}</span>
          <span className={`friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''} left-margin-10px`}>
            {`${friendInfo.year % 100}학번`}
          </span>
        </div>
        <div className="friendOtherItem-basic-info-container">
          <span
            className={
              friendInfo.major2 && friendInfo.major2 !== ""
                ? `friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''} rght-margin-3px`
                : `friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''}`
            }
          >
            {friendInfo.major1}
          </span>
          {friendInfo.major2 && friendInfo.major2 !== "" && (
            <>
              <span className={`friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''} left-margin-3px right-margin-3px`}>
                {"・"}
              </span>
              <span className={`friendOtherItem-info${(isLock != null) ? (isLock ? ' friendOtherItem-locked' : '') : ''} left-margin-3px`}>
                {friendInfo.major2}
              </span>
            </>
          )}
        </div>
        {
          (isLock != null) && (isLock) && (lockMessage != null) &&
          <div
            style={{
              marginTop: '5px'
            }}
          >
            <InfoMessage
              type={"good"}
              message={lockMessage}
            />
          </div>
        }
      </div>
    </div>
  );
}
