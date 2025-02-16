import React, { useState, useEffect } from "react";
import api from "../../api";
import ProjectView from "../../components/Project/ProjectView";
import "../../styles/LikedProject.css"
import backIcon from "../../assets/Profile/left-arrow.svg"

function LikedProject() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProjects();
  }, []);

  // 프로젝트 정보 가져오기
  const getProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/projects/liked-list/");
      await setProjects(response.data);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  /** go back handler */
  const handleBackButton = () => {
    window.history.back();
  };

  return (
    <div className='LikedProject-body'>
      <div className="LikedProject-container">
        {/** Backward button */}
        <div className="LikedProject-backward-btn-container">
          <button
          className="LikedProject-backbutton"
          onClick={() => handleBackButton()}
          >
          <img src={backIcon} />
          </button>
        </div>
      </div>
      {/** Title */}
      <div className='LikedProject-title-container'>
        {"좋아요 한 게시글"}
      </div>
      {(!isLoading) && projects &&
        projects.length > 0 &&
        projects.map((project) => (
          <ProjectView
            viewId={`proj-${project["project_id"]}`}
            key={project["project_id"]}
            projectId={project["project_id"]}
            updateProjectList={getProjects}
          />
        ))
      }
      {(!isLoading) && (projects.length === 0) && (
        <div className="LikedProject-nothing">
          <p>좋아요 한 게시물이 아직 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default LikedProject;
