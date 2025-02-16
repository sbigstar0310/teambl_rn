import React, {useEffect, useState} from "react";
import "../../styles/Project/ProjectView.css";
import api from "../../api";
import ProjectResultViewContent from "./ProjectResultViewContent.jsx";
import ProjectResultViewHeader from "./ProjectResultViewHeader.jsx";
import ProjectResultViewAuthorInfo from "./ProjectResultViewAuthorInfo.jsx";
import ProjectViewComment from "../Project/ProjectViewComment.jsx";

const ProjectResultView = ({viewId, projectId}) => {
    const userId = localStorage.getItem("userId");

    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [projectData, setProjectData] = useState({});
    const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
    const [commentList, setCommentList] = useState([]);
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

    const updateComment = async () => {
        try {
            const res = await api.get(`/api/projects/${projectId}/comments/`);
            await setCommentList(res.data);
        } catch (e) {
            await setCommentList([]);
        }
    };

    const handleCommentSectionToggle = () => {
        setIsCommentSectionOpen(!isCommentSectionOpen);
    }

    useEffect(() => {
        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);
    useEffect(() => {
        if (isCommentSectionOpen && projectId) {
            updateComment();
        }
    }, [isCommentSectionOpen]);

    if (isError) {
        return (
            <div className="projectView-main-container" id={viewId}>
                {"정보를 불러오지 못했어요."}
            </div>
        );
    }

    return (
        <div id={viewId} style={{borderBottom: "1px solid #ccc"}} className="p-4 flex flex-col gap-2">
            <ProjectResultViewHeader isLoading={isLoading} projectData={projectData}
                                     onCommentSectionToggle={handleCommentSectionToggle} projectId={projectId}/>
            <ProjectResultViewAuthorInfo isLoading={isLoading} data={projectData}
                                         isOwner={projectData?.user?.id == userId}
                                         projectId={projectId}
                                         isRelationLoading={isRelationLoading}
                                         relationshipDegree={relationshipDegree}
            />
            <ProjectResultViewContent isLoading={isLoading} data={projectData}/>
            {
                isCommentSectionOpen &&
                <ProjectViewComment
                    isOpen={isCommentSectionOpen}
                    commentList={commentList}
                    updateCommentList={updateComment}
                    projectId={projectId}
                    userInfo={userId ? userId : {}}
                />
            }
        </div>
    );
};

export default ProjectResultView;
