import React, { useState, useEffect } from "react";
import api from "../../api";
import SingleProjectView from "../../components/ProjectLogout/SingleProjectView";
import ProjectView from "../../components/Project/ProjectView";
import { useParams } from "react-router-dom";
import "../../styles/SingleProject.css"
import backIcon from "../../assets/Profile/left-arrow.svg"

function SingleProjectLogout() {
  const [projects, setProjects] = useState([]);

  const { projectId } = useParams();

  useEffect(() => {
    getProjects();
  }, []);

  // 프로젝트 정보 가져오기
  // const getProjects = () => {
  //   api
  //     .get( `/api/projects/${projectId}/`)
  //     .then((res) => res.data)
  //     .then((data) => {
  //       setProjects(data);
  //     })
  //     .catch((err) => alert(err));
  // };
  
  const getProjects = () => {
    api
    .get(`/api/projects/${projectId}/`, {
      headers: {
        Authorization: "", // 헤더 비우기
      },
      withCredentials: false, // 쿠키 전송 비활성화
    })
    .then((res) => setProjects(res.data))
    .catch((err) => {
      console.log(err.response.status); // 401 오류 확인
      alert(err.response.data?.detail || "An error occurred");
    });
  };

  /** go back handler */
  const handleBackButton = () => {
    console.log(window.history);
    window.history.back();
  };
  
  return (
    <div>
      {/** Backward button */}
      <div className="SingleProject-backward-btn-container">
        <button
        className="SingleProject-backbutton"
        onClick={() => handleBackButton()}
        >
        <img src={backIcon} />
        </button>
      </div>
      <SingleProjectView
        viewId={`proj-${projects["project_id"]}`}
        key={projects["project_id"]}
        projectId={projects["project_id"]}
        updateProjectList={getProjects}
      />
    </div>
  );
}

export default SingleProjectLogout;
