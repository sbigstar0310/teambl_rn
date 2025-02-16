import React, { useEffect, useState } from "react";
import "../../styles/Project/ProjectView.css";
import api from "../../api";
import ProjectViewProfileAndMenu from "./ProjectViewProfileAndMenu";
import ProjectViewContent from "./ProjectViewContent";
import ProjectViewImage from "./ProjectViewImage";
import ProjectViewBottomInfo from "./ProjectViewBottomInfo";

const ProjectView = ({ viewId, updateProjectList, projectId }) => {
  const currentUserId = localStorage.getItem("userId");

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [projectData, setProjectData] = useState({});
  const [relationshipDegree, setRelationshipDegree] = useState(null);
  const [isRelationLoading, setIsRelationLoading] = useState(true);

  /** fetch project data */
  const fetchProjectData = async () => {
    /** 이후 해당 프로젝트의 데이터만 수신하는 구조로 변경해야 할 듯함 */
    await setIsLoading(true);
    await setIsError(false);
    try {
      const res = await api.get(`/api/projects/${projectId}/`);
      let data = res.data;
      await setProjectData(data);
      getRelationshipDegree(data?.user?.id);
    } catch (e) {
      await setIsError(true);
      console.log(e);
    } finally {
      await setIsLoading(false);
    }
  };
  // 현재 유저와 타겟 유저의 촌수를 가져오는 메소드
  const getRelationshipDegree = async (targetUserId) => {
    if(targetUserId){
      await setIsRelationLoading(true);
      try {
        const response = await api.get(`/api/get-user-distance/${targetUserId}/`);
        const degree = response.data.distance;
        setRelationshipDegree(degree);
      } catch (error) {
        console.log(error);
      } finally {
        await setIsRelationLoading(false);
      }
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  if (isError) {
    return (
      <div className="projectView-main-container" id={viewId}>
        {"정보를 불러오지 못했어요."}
      </div>
    );
  }

  return (
    <div className="projectView-main-container" id={viewId}>
      {/** top profile and menu button */}
      <ProjectViewProfileAndMenu
        isLoading={isLoading}
        isRelationLoading={isRelationLoading}
        isOwner={projectData?.user?.id == currentUserId}
        data={projectData}
        projectId={projectId}
        updateList={updateProjectList}
        ownerId={projectData?.user?.id}
        relationshipDegree={relationshipDegree}
      />
      {/** content */}
      <ProjectViewContent isLoading={isLoading} data={projectData} />
      {/** image */}
      {projectData["images"] && projectData["images"].length > 0 && (
        <ProjectViewImage imageUrlList={projectData["images"]} />
      )}
      {/** members & comments & like */}
      <ProjectViewBottomInfo
        isLoading={isLoading}
        data={projectData}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectView;
