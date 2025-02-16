import React, { useEffect, useState } from "react";
import "../../styles/ProfilePage/ProfileSelfProject.css";
import api from "../../api";
import { useLocation, useNavigate } from "react-router-dom";
import ProjectView from "../../components/Project/ProjectView";

const ProfileOtherProjects = ({ userId }) => {
    const navigate = useNavigate();
    const { hash } = useLocation();

    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [projectList, setProjectList] = useState([]);

    /** auto-scroll */
    useEffect(() => {
        if (projectList.length > 0 && hash) {
            const scrollToElement = () => {
                const element = document.getElementById(
                    `proj-${hash.replace("#", "")}`
                );
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            };

            const timeoutId = setTimeout(scrollToElement, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [projectList, hash]);

    /** state init */
    const initializeAll = async () => {
        /** When needed someday */
    };

    /** fetch project list */
    const fetchProjectList = async (callback) => {
        await setIsLoading(true);
        await setIsError(false);
        try {
            const res = await api.get("/api/projects/every/");
            let newProjectList = res.data.filter((obj) => {
                return (obj.user.id == userId);
            })
            await setProjectList(newProjectList);
            if (callback) {
                await callback();
            }
        } catch (e) {
            console.log(e);
            await setIsError(true);
        } finally {
            await setIsLoading(false);
        }
    };

    /** effects */
    useEffect(() => {
        fetchProjectList();
    }, []);

    /** return components */
    if (isLoading) {
        return (
            <div className="profileSelfProject-loader-container">
                <div className="profileSelfProject-loader" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="profileSelfProject-error-container">
                {"게시물 정보를 불러오는 데 실패했습니다."}
            </div>
        );
    }

    return (
        <div className="profileSelfProject-container">
            {projectList.length === 0 && (
                <div className="profileSelfProject-no-content-container">
                    <span className="profileSelfProject-no-content-message">
                        {"아직 작성한 게시물이 없습니다."}
                    </span>
                    <button
                        className="profileSelfProject-no-content-other-button profileSelfProject-mt-8"
                        onClick={() => navigate('/search')}
                    >
                        {"다른 게시물을 찾아볼까요?"}
                    </button>
                </div>
            )}
            {/** project view */}
            {projectList.length > 0 && (
                <div className="profileSelfProject-content-container">
                    {projectList.map((projectInfo) => {
                        return (
                            <ProjectView
                                viewId={`proj-${projectInfo["project_id"]}`}
                                key={projectInfo["project_id"]}
                                projectId={projectInfo["project_id"]}
                                updateProjectList={fetchProjectList}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProfileOtherProjects;
