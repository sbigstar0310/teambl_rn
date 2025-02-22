import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Start.css";
import { toastText } from "../components/Toast/Toast";
import TeamblIcon from "../assets/teamblIcon.svg"

const Start = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    toastText("곧 출시 예정입니다!");
  };

  return (
    <div className="start">
      <div>
        <img
          src={TeamblIcon}
          alt="팀블로고"
          className="teambl-icon"
        />
      </div>
      <div className="start-container">
        <span className="start-span">
          신뢰 기반의<br/>
          프로젝트 네트워크, 팀블!
        </span>
        <label className="start-label1">
          진행 중인 다양한 프로젝트를 살펴보고,<br/>
          관심있는 프로젝트를 응원하며 소통을 시작해보세요!
        </label>
        <label className="start-label2">
          문의하기: info@teambl.net
        </label>
        <label className="start-label2">
          (주)팀블, 대표이사 김종현
        </label>
        <button type="button" className="start-loginBtn" onClick={handleLogin}>
          앱 다운로드
        </button>
      </div>
    </div>
  );
};

export default Start;
