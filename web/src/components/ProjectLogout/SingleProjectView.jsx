import React, { useEffect, useState } from "react";
import "../../styles/Project/ProjectView.css";
import api from "../../api";
import ProjectViewProfileAndMenu from "../ProjectLogout/ProjectViewProfileAndMenu";
import ProjectViewContent from "../ProjectLogout/ProjectViewContent";
import ProjectViewImage from "../ProjectLogout/ProjectViewImage";
import ProjectViewBottomInfo from "../ProjectLogout/ProjectViewBottomInfo";

const SingleProjectView = ({ viewId, updateProjectList, projectId }) => {
  const currentUserId = localStorage.getItem("userId");

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [projectData, setProjectData] = useState({});

  /** fetch project data */
  const fetchProjectData = async () => {
    /** 이후 해당 프로젝트의 데이터만 수신하는 구조로 변경해야 할 듯함 */
    await setIsLoading(true);
    await setIsError(false);
    try {
      const res = await api.get(`/api/projects/${projectId}/`);
      let data = res.data;
      await setProjectData(data);
    } catch (e) {
      await setIsError(true);
      console.log(e);
    } finally {
      await setIsLoading(false);
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
        isOwner={projectData?.user?.id == currentUserId}
        data={projectData}
        projectId={projectId}
        updateList={updateProjectList}
        ownerId={projectData?.user?.id}
      />
      {/** content */}
      <ProjectViewContent isLoading={isLoading} data={projectData} />
      {/** image */}
      {projectData["images"] && projectData["images"].length > 0 && (
        <ProjectViewImage imageUrlList={projectData["images"]} />
      )}
    </div>
  );
};

export default SingleProjectView;
