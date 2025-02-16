import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import profileDefaultImg from "../../assets/ProfileOther/defaultProfile.svg";
import backIcon from "../../assets/ProfileOther/left-arrow.svg";
import friendIcon from "../../assets/ProfileOther/friend.svg";
import "../../styles/ProfilePage/ProfileOther.css";
import api from "../../api";
import FriendRequestPopup from "../FriendPage/FriendRequestPopup";
import RelationView from "../../components/RelationView";
import ExperienceView from "../../components/Experience/ExperienceView";
import InnerNavBar from "../../components/InnerNavBar";
import ProfileSelfProject from "./ProfileSelfProject";
import ProfileOtherProjects from "./ProfileOtherProjects";
import { toastText } from "../../components/Toast/Toast";

const ProfileOther = ({ userId }) => {
  const [profile, setProfile] = useState({
    user_name: "",
    school: "",
    current_academic_degree: "",
    year: 0,
    major1: "",
    major2: "",
    one_degree_count: 0,
    introduction: "",
    image: profileDefaultImg,
    keywords: [],
    skills: [],
    experiences: [],
    portfolio_links: [],
  });
  const [paths, setPaths] = useState([]); // 여러 경로 상태 추가
  const [pathsId, setPathsId] = useState([]); // 여러 경로 아이디
  const [fromId, setFromId] = useState([]); // 현재 유저 아이디
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null); // 오류 상태 추가
  const [currentUserId, setCurrentUserId] = useState("");
  const [showFinalDelete, setShowFinalDelete] = useState(false); // 최종 확인 팝업 상태 추가
  const [isFriendRequestPending, setIsFriendRequestPending] = useState(false); // 현재 일촌 신청 대기 여부
  const [isPathLoading, setIsPathLoading] = useState(true);
  const [currentUserInfo, setCurrentUserInfo] = useState({});
  const [isFriend, setIsFriend] = useState(false);
  const [isFriendRequstLoading, setIsFriendRequstLoading] = useState(false);
  const [expCount, setExpCount] = useState(0);
  const [selectedNavValue, setSelectedNavValue] = useState("info");
  const navigate = useNavigate();

  const [relationshipDegree, setRelationshipDegree] = useState(null);

  const closeFriendDeleteModal = () => {
    setShowFinalDelete(false);
  };

  /** url 새 탭 열기 메소드 */
  const openUrl = (url) => {
    window.open(url, "_blank", "noopener, noreferrer");
  };

  /** 현재 사용자의 정보를 가져오는 메소드 */
  const getCurrentUserInfo = async () => {
    try {
      const res = await api.get(`/api/current-user/`);
      await setCurrentUserInfo(res.data);
      await setIsPathLoading(false);
      await setError(false);
    } catch (e) {
      await setError(true);
      console.log(e);
    }
  };

  // /* path 리스트를 가공하는 유틸 메소드 */
  // const formatPath = (pathList) => {
  //   if (pathList.length > 0) {
  //     if (pathList[0].length === 3) {
  //       /* 2 chon */
  //       let newList = [];
  //       for (let i = 0; i < pathList.length; i++) {
  //         newList.push(pathList[i][1]);
  //       }
  //       return newList;
  //     } else if (pathList[0].length === 4) {
  //       /* 3 chon */
  //       let newList = [];
  //       for (let i = 0; i < pathList.length; i++) {
  //         let tempList = [...pathList[i]];
  //         tempList.splice(0, 1);
  //         tempList.splice(2, 1);
  //         newList.push(tempList);
  //       }
  //       return newList;
  //     }
  //   }
  //   return [];
  // };

  // 현재 유저와 타겟 유저의 촌수를 가져오는 메소드
  const getRelationshipDegree = async (targetUserId) => {
    try {
      const response = await api.get(`/api/get-user-distance/${targetUserId}/`);
      const degree = response.data.distance;
      setRelationshipDegree(degree);
    } catch (error) {
      console.error("Error fetching relationship degree:", error);
      return null;
    }
  };

  /* 프로필 유저의 일촌 수를 최신으로 업데이트 해주는 함수 */
  const updateOneDegreeCount = async (targetUserId) => {
    try {
      const response = await api.post(
        `/api/profile/updateOneDegreeCount/${targetUserId}/`
      );
      const one_degree_count = response.data.one_degree_count;
    } catch (error) {
      console.error("Error updating one_degree_count:", error);
    }
  };

  useEffect(() => {
    getRelationshipDegree(userId);
    updateOneDegreeCount(userId);
    fetchProfile(userId);
    fetchUserPaths(userId);
  }, [userId]);

  /* 해당 사용자의 정보를 가져오는 함수 */
  /* 정보 수신이 완료되면, 일촌 신청 대기 여부를 확인(일촌 리스트 수신) */
  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(`/api/user/${userId}/`);
      setProfile(response.data.profile);
      setError(null); // 오류 상태 초기화
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError("존재하지 않는 사용자입니다."); // 404 오류 메시지 설정
      } else {
        setError("사용자 정보를 불러오지 못했습니다.");
      }
    }

    /* 현재 일촌 신청 대기 여부 확인 */
    await setIsFriendRequestPending(false);
    await setIsFriend(false);
    api
      .get("/api/friends/")
      .then((res) => res.data)
      .then(async (data) => {
        let friendList = data;
        let isPending = false;
        for (let i = 0; i < friendList.length; i++) {
          if (friendList[i]["to_user"]["id"] == userId) {
            // str & integer comparision
            isPending = friendList[i]["status"] === "pending";
          }
          /* 일촌 여부를 확인 */
          if (
            friendList[i]["to_user"]["id"] == userId ||
            friendList[i]["from_user"]["id"] == userId
          ) {
            if (friendList[i]["status"] === "accepted") {
              await setIsFriend(true);
            }
          }
        }
        await setIsFriendRequestPending(isPending);
      })
      .catch((err) => {
        alert(err);
      })
      .finally(async () => {
        await setLoading(false);
      });
  };

  // 1촌을 추가하는 함수 (userId를 사용)
  const addFriend = async (e) => {
    setIsFriendRequstLoading(true);
    e.preventDefault();
    try {
      const userResponse = await api.get(`/api/profile/${currentUserId}/`);
      const oneDegreeCount = userResponse.data.one_degree_count;

      // if (oneDegreeCount >= 50) {
      //   alert("1촌 수가 50명을 초과하여 더 이상 일촌 추가가 불가능합니다.");
      //   return; // 친구 추가 중단
      // }

      const response = await api.post("/api/friends/", {
        to_user_id: userId, // Ensure this is the correct field
      });

      if (response.status === 201) {
        toastText("1촌 신청 완료!");
        setShowFinalDelete(false); // 팝업 닫기
        fetchProfile(userId); // 정보 갱신
        // getChons(); // 친구 목록 갱신
      }
      setIsFriendRequstLoading(false);
    } catch (error) {
      console.error(
        "Error in addFriend:",
        error.response ? error.response.data : error.message
      );

      // 서버로부터 받은 에러 메시지를 표시
      if (error.response && error.response.data) {
        toastText(
          `${error.response.data.detail || "1촌 신청 중 오류가 발생했습니다."}`
        );
      } else {
        toastText("1촌 신청 중 오류가 발생했습니다.");
      }

      setIsFriendRequstLoading(false);
    }
  };

  // 모든 경로를 가져오는 함수
  const fetchUserPaths = async (userId) => {
    try {
      await setIsPathLoading(true);
      const response = await api.get(`/api/path/${userId}/`);
      setCurrentUserId(response.data.current_user_id);
      setPaths(response.data.paths_name);
      setPathsId(response.data.paths_id);
      setFromId(response.data.current_user_id);
      getCurrentUserInfo();
      await setIsPathLoading(false);
      await setError(false);
    } catch (error) {
      console.error("유저 경로를 불러오는 중 오류가 발생했습니다.", error);
      await setIsPathLoading(false);
      await setError(true);
    }
  };

  const handleBack = () => {
    // if (location?.state) {
    //   if ((location.state.preventComeBack != null) && location.state.preventComeBack) {
    //     navigate(location.pathname, {
    //       state : {
    //         ...location.state,
    //         preventComeBack: null
    //       }
    //     });
    //     navigate(`/home`);
    //   }
    // } else {
    //   window.history.back();
    // }
    window.history.back();
  }


  if (loading) {
    return (
      <div className="profileSelf2-loader-container">
        <div className="profileSelf2-loader" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profileSelf2-body profileSelf-with-pd-28">
        <div className="profileSelf2-container">
          {/** Backward button */}
          <div className="profileSelf2-backward-btn-container">
            <button
              className="profileSelf2-backbutton"
              onClick={() => handleBackButton()}
            >
              <img src={backIcon} />
            </button>
          </div>
        </div>
        <div className="profileSelf2-error-container">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="profileOther-body">
      <div
        className="profileOther-container"
        style={{
          paddingBottom: "0px",
        }}
      >
        {isFriendRequstLoading && (
          <div className='profileOther-loader-container'>
            <div className='profileOther-loader'>
            </div>
          </div>
        )}
        <button
          className="profileOther-backbutton"
          onClick={() => window.history.back()}
        >
          <img src={backIcon}></img>
        </button>

        <div className="profileOther-top">
          <div className="profileOther-profile-image">
            <img
              src={profile.image ? profile.image : profileDefaultImg}
              alt="Profile Image"
            />
          </div>
          <div className="profileOther-profile-detail">
            <div className="profileOther-profile-row1">
              <div className="profileOther-profile-name">
                {profile.user_name}
              </div>
              <div className="profileOther-profile-relationshipDegree">
                ・ {relationshipDegree ? `${relationshipDegree}촌` : "4촌 이상"}
              </div>
              {
                (relationshipDegree !== 1) &&
                <button
                  className={
                    "profileOther-oneDegree-button" +
                    (isFriendRequestPending ? " to-disabled-button" : "")
                  }
                  onClick={() => {
                    if (!isFriendRequestPending) {
                      setShowFinalDelete(true);
                    }
                  }} // 버튼 클릭 시 팝업 열기
                >
                  {isFriendRequestPending ? "수락 대기" : "1촌 신청"}
                </button>
              }
              {showFinalDelete && (
                <FriendRequestPopup
                  profile={profile}
                  closeFriendDeleteModal={closeFriendDeleteModal}
                  addFriend={addFriend}
                />
              )}
            </div>

            <div className="profileOther-profile-row2">
              {profile.school} | {profile.current_academic_degree} |{" "}
              {profile.year % 100} 학번
            </div>
            <div className="profileOther-profile-row3">
              {profile.major1}
              {profile.major2 &&
                profile.major2.trim() !== "" &&
                ` ・ ${profile.major2}`}
            </div>
            <div className="profileOther-profile-row4">
              <div
                className="profileOther-profile-one_degree_count"
                onClick={() => {
                  if (profile.one_degree_count > 0) {
                    navigate(`/profile/${userId}/friends`);
                  }
                }}
              >
                <div>1촌 {profile.one_degree_count}명</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!isFriend && (
        <div
          className="profileOther-container"
          style={{
            paddingTop: "0px",
          }}
        >
          <div className="profileOther-title-path">나와의 관계</div>
          {/** no relationship : over 3 chon */}
          {paths.length === 0 && (
            <RelationView
              fromName={currentUserInfo?.profile?.user_name}
              fromId={fromId}
              toName={profile["user_name"]}
              relationList={[]}
              relationIdList={[]}
              chon={99}
              isLoading={isPathLoading}
            />
          )}
          {/** 2 chon */}
          {paths.length > 0 && paths[0].length === 1 && (
            <RelationView
              fromName={currentUserInfo?.profile?.user_name}
              fromId={fromId}
              toName={profile["user_name"]}
              relationList={paths}
              relationIdList={pathsId}
              chon={2}
              isLoading={isPathLoading}
            />
          )}
          {/** 3 chon */}
          {paths.length > 0 && paths[0].length === 2 && (
            <RelationView
              fromName={currentUserInfo?.profile?.user_name}
              fromId={fromId}
              toName={profile["user_name"]}
              relationList={paths}
              relationIdList={pathsId}
              chon={3}
              isLoading={isPathLoading}
            />
          )}
        </div>
      )}
      <InnerNavBar
        titleList={[
          { label: "정보", value: "info" },
          { label: "게시물", value: "project" },
        ]}
        labelKey={"label"}
        dataKey={"value"}
        currentSelectedItem={selectedNavValue}
        onSelectItem={setSelectedNavValue}
      />
      <div className="profileSelf2-middle-bar">{/** no content */}</div>
      {/** navigation */}
      {
        (selectedNavValue === "info") &&
        <>
          <div
            className="profileOther-container"
            style={{
              paddingBottom: '0'
            }}
          >
            <div className="profileOther-keyword-title">관심사</div>
            <div className="profileOther-keywords">
              {profile.keywords.length === 0 ? (
                <div className="profileOther-list-element">
                  상대방이 관심사를 아직 입력하지 않았어요.
                </div>
              ) : (
                profile.keywords.map((keyword, index) => (
                  <div className="profileOther-keyword" key={index}>
                    {keyword}
                  </div>
                ))
              )}
            </div>
          </div>
          {
            (expCount > 0) &&
            <div
              style={{
                width: '100%',
                paddingLeft: '20px',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            >
              <div className="profileOther-tools-title">경험</div>
            </div>
          }
          {/** exp */}
          <ExperienceView
            userId={userId}
            setCount={setExpCount}
          />
          <div
            className="profileOther-container"
            style={(expCount > 0) ?
              {
                paddingTop: '36px'
              }
              :
              {}
            }
          >
            <div className="profileOther-tool-flex-box">
              <div className="profileOther-tools-title">스킬</div>
              <div
                className="profileOther-tool-container"
              >
                {profile.skills.length === 0 ? (
                  <div className="profileOther-list-element">
                    상대방이 스킬을 아직 입력하지 않았어요.
                  </div>
                ) : (
                  profile.skills.map((skill, index) => (
                    <div className="profileOther-keyword" key={index}>
                      {skill['skill']}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="profileOther-introduction-title">소개</div>
            <div className="profileOther-introduction">
              {profile.introduction.length === 0 ? (
                <div className="profileOther-introduction-body">
                  상대방이 소개를 아직 입력하지 않았어요.
                </div>
              ) : (
                <div className="profileOther-introduction-body">
                  {profile.introduction}
                </div>
              )}
            </div>

            <div className="profileOther-portfolioLinks-title">포트폴리오</div>
            <div className="profileOther-protfolioLinks">
              {profile.portfolio_links.length === 0 ? (
                <div className="profileOther-list-element">
                  상대방이 포트폴리오를 아직 입력하지 않았어요.
                </div>
              ) : (
                profile.portfolio_links.map((portfolio_links, index) => (
                  <div
                    className="profileOther-list-element"
                    key={index}
                    onClick={() => openUrl(portfolio_links.portfolioLink)}
                  >
                    {portfolio_links.portfolioLink}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      }
      {selectedNavValue === "project" && <ProfileOtherProjects userId={userId} />}
    </div>
  );
};

export default ProfileOther;
