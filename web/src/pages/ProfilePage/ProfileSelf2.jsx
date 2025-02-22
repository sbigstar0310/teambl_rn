import React, { useEffect, useState } from "react";
import "../../styles/ProfilePage/ProfileSelf2.css";
import profileDefaultImg from "../../assets/Profile/defaultProfile.svg";
import {
    useLocation,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import api from "../../api";
import backIcon from "../../assets/Profile/left-arrow.svg";
import { useDropzone } from "react-dropzone";
import InnerNavBar from "../../components/InnerNavBar";
import ItemEditor from "../../components/ItemEditor";
import MessagePopUp from "../../components/MessagePopUp";
import ProfileSelfProject from "./ProfileSelfProject";
import ExperienceView from "../../components/Experience/ExperienceView";
import { toastText } from "../../components/Toast/Toast";

/**
 * 기존 ProfileSelf.jsx 변경점
 *
 * 1. 로딩 및 에러 관련 UI 추가
 * 2. 프로필 이미지와 정보 수정 분리
 * 3. ItemEditBox.jsx 컴포넌트 사용
 * 4. received profile 사용 안함
 * 5. form => free format으로 변경
 * 6. 기타 UI 피그마 디자인과 맞춤
 * 7. 게시물 (프로젝트) 화면 추가
 */
const ProfileSelf2 = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { id } = useParams();

    /** meta states */
    const [isLoading, setIsLoading] = useState(true);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [isImageSaveLoading, setIsImageSaveLoading] = useState(false);
    const [isLinkValid, setIsLinkValid] = useState(false);
    const [expUpdateTrigger, setExpUpdateTrigger] = useState(false);
    /** data states */
    const [profileImage, setProfileImage] = useState(null);
    const [fixedProfile, setFixedProfile] = useState({});
    const [profile, setProfile] = useState({});
    /** nav states */
    const [selectedNavValue, setSelectedNavValue] = useState("info");

    /** popups */
    const [isSaveSuccessPopupOpen, setIsSaveSuccessPopupOpen] = useState(false);
    const [isSaveFailPopupOpen, setIsSaveFailPopupOpen] = useState(false);

    /** initialize all states */
    const initializeAll = () => {
        setIsLoading(true);
        setIsSaveLoading(false);
        setIsError(false);
        setIsEdited(false);
        setIsImageSaveLoading(false);
        setIsLinkValid(false);
        setProfileImage(null);
        setFixedProfile({});
        setProfile({});
        setSelectedNavValue(searchParams.get("deft-route") || "info");
        setIsSaveSuccessPopupOpen(false);
        setIsSaveFailPopupOpen(false);
    };

    /** for image upload */
    const onDrop = async (acceptedFiles) => {
        await setIsImageSaveLoading(true);
        const file = acceptedFiles[0];

        /** update profile image */
        const imageData = new FormData();
        imageData.append("image", file);

        try {
            /** upload image */
            await api.put("/api/profile/update/", imageData);
            await setIsSaveSuccessPopupOpen(true);
            /** refresh user data */
            await fetchUserInformation();
        } catch (e) {
            await setIsSaveFailPopupOpen(true);
            console.log(e);
        } finally {
            await setIsImageSaveLoading(false);
        }
    };

    /** image upload dropzone */
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        noClick: true,
    });

    /** image upload handler */
    const handleImageClick = () => {
        document.getElementById("profself2-fileInput").click();
    };

    /** data fetch */
    /** order to fetch
     * 1. User information
     */
    const refreshData = async () => {
        await setIsLoading(true);
        await setIsError(false);
        await fetchUserInformation();
        await setIsLoading(false);
    };

    // 오류가 발생해서 아래 버전으로 변경했고, 해결됐음 [11.18 대용]

    // const fetchUserInformation = async () => {
    //     try {
    //         const res = await api.get("/api/current-user/");
    //         let newProfile = res.data.profile;
    //         console.log(newProfile);
    //         /** delete garbage data */
    //         if (newProfile.portfolio_links.length > 0) {
    //             let newPortfolio = newProfile.portfolio_links.map((prevObj) => {
    //                 return prevObj["portfolioLink"];
    //             });
    //             newProfile["portfolio_links"] = newPortfolio;
    //         }
    //         if (newProfile.skills.length > 0) {
    //             let newSkills = newProfile.skills.map((prevObj) => {
    //                 return prevObj["skill"];
    //             });
    //             newProfile["skills"] = newSkills;
    //         }
    //         if (newProfile.experiences.length > 0) {
    //             let newExps = newProfile.experiences.map((prevObj) => {
    //                 return prevObj["title"];
    //             });
    //             newProfile["experiences"] = newExps;
    //         }
    //         /** extract profile image */
    //         await setProfileImage(newProfile["image"]);
    //         /** delete unneccesary fields */
    //         delete newProfile["image"];
    //         await setFixedProfile(JSON.parse(JSON.stringify(newProfile)));
    //         await setProfile(newProfile);
    //     } catch (e) {
    //         setIsError(true);
    //         console.log(e);
    //     }
    // };
    const fetchUserInformation = async () => {
        try {
            const res = await api.get("/api/user/current/");
            let newProfile = res.data.profile || {};
    
            // 초기값 설정
            newProfile.portfolio_links = newProfile.portfolio_links || [];
            newProfile.skills = newProfile.skills || [];
            newProfile.experiences = newProfile.experiences || [];
    
            /** delete garbage data */
            if (Array.isArray(newProfile.portfolio_links) && newProfile.portfolio_links.length > 0) {
                let newPortfolio = newProfile.portfolio_links.map((prevObj) => {
                    return prevObj["portfolioLink"];
                });
                newProfile["portfolio_links"] = newPortfolio;
            }
            if (Array.isArray(newProfile.skills) && newProfile.skills.length > 0) {
                let newSkills = newProfile.skills.map((prevObj) => {
                    return prevObj["skill"];
                });
                newProfile["skills"] = newSkills;
            }
            if (Array.isArray(newProfile.experiences) && newProfile.experiences.length > 0) {
                let newExps = newProfile.experiences.map((prevObj) => {
                    return prevObj["title"];
                });
                newProfile["experiences"] = newExps;
            }
    
            /** extract profile image */
            await setProfileImage(newProfile["image"]);
    
            /** delete unnecessary fields */
            delete newProfile["image"];
            await setFixedProfile(JSON.parse(JSON.stringify(newProfile)));
            await setProfile(newProfile);
        } catch (e) {
            setIsError(true);
            console.log(e);
        }
    };

    /** save profile */
    const saveProfile = async () => {
        await setIsSaveLoading(true);
        let requestBody = JSON.parse(JSON.stringify(profile));
        /** reshape */
        /** portfolioLink */
        let newPPList = [];
        for (let i = 0; i < requestBody["portfolio_links"].length; i++) {
            newPPList.push({ portfolioLink: requestBody["portfolio_links"][i] });
        }
        requestBody["portfolio_links"] = newPPList;
        /** experience */
        let newExpList = [];
        for (let i = 0; i < requestBody["experiences"].length; i++) {
            newExpList.push({ experience: requestBody["experiences"][i] });
        }
        requestBody["experiences"] = newExpList;
        /** skill */
        let newSkillList = [];
        for (let i = 0; i < requestBody["skills"].length; i++) {
            newSkillList.push({ skill: requestBody["skills"][i] });
        }
        requestBody["skills"] = newSkillList;

        /** major2 */
        requestBody["major2"] = requestBody["major2"] || "";

        /** axios call */
        try {
            await api.put("/api/profile/update/", requestBody);
            setIsSaveSuccessPopupOpen(true);
        } catch (e) {
            console.log(e);
            setIsSaveFailPopupOpen(true);
        } finally {
            /** re-fetch */
            await setIsError(false);
            await fetchUserInformation();
            await setExpUpdateTrigger(!expUpdateTrigger);
            await setIsSaveLoading(false);
        }
    };

    /** utils */
    const isEditedFromTwoObject = (obj1, obj2) => {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return true;
        } else {
            let obj1_sorted = Object.keys(obj1)
                .sort()
                .reduce((obj, key) => ((obj[key] = obj1[key]), obj), {});
            let obj2_sorted = Object.keys(obj2)
                .sort()
                .reduce((obj, key) => ((obj[key] = obj2[key]), obj), {});

            return JSON.stringify(obj1_sorted) !== JSON.stringify(obj2_sorted);
        }
    };

    /** check prev is edit project */

    /** go back handler */
    const handleBackButton = () => {
        if ( isEdited ) {
            toastText("저장되지 않은 변경 사항이 있습니다.\n저장 후 이동하세요!")
            scrollToSaveButton();
        } else {
            navigate("/home");
        }
    };

    const handleEdit = () => {
        navigate("/editprofile", {
            state: {
                profile: profile,
                EditProfile: true,
            },
        });
    };

    /** state update helper */
    const updateProfile = async (key, value) => {
        await setProfile((prevObj) => {
            let newObj = { ...prevObj };
            newObj[key] = value;
            return newObj;
        });
    };

    /** URL validation */
    function isValidURL(url) {
        const pattern = new RegExp(
            "^(https?|ftp|ftps):\\/\\/" /** accepted protocols : http, https, ftp, ftps */ +
            "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" /** domain name */ +
            "((\\d{1,3}\\.){3}\\d{1,3}))" /** or IP address */ +
            "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" /** port and path */ +
            "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" /** query params */ +
            "(\\#[-a-zA-Z\\d_]*)?$",
            "i"
        ); /** fragment params */
        return !!pattern.test(url);
    }

    /** effects */
    useEffect(() => {
        initializeAll();
        refreshData();
    }, []);

    useEffect(() => {
        setIsEdited(isEditedFromTwoObject(profile, fixedProfile));
    }, [profile]);

    useEffect(() => {
        if (!profile["portfolio_links"]) {
            return;
        }
        if (profile["portfolio_links"].length === 0) {
            setIsLinkValid(true);
        } else {
            let isValidRes = true;
            for (let i = 0; i < profile["portfolio_links"].length; i++) {
                isValidRes = isValidRes && isValidURL(profile["portfolio_links"][i]);
            }
            setIsLinkValid(isValidRes);
        }
    }, [profile["portfolio_links"]]);

    // 화면 자동 스크롤 처리
    const scrollToSaveButton = () => {
        document.getElementById("savebtn")?.scrollIntoView({ behavior: "smooth"});
    };

    // 브라우저 리로드, 닫기 방지
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isEdited) {
                toastText("저장되지 않은 변경 사항이 있습니다.\n저장 후 이동하세요!")
                scrollToSaveButton();
                e.preventDefault();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isEdited]);

    /** return component */
    if (isLoading) {
        return (
            <div className="profileSelf2-loader-container">
                <div className="profileSelf2-loader" />
            </div>
        );
    }

    if (isError) {
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
                    {"내 프로필 정보를 불러오는 데 실패했습니다."}
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className="profileSelf2-body"
            >
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
                {/** Title */}
                <div className="profileSelf2-title-container">{"내 프로필"}</div>
                {/** Image & Basic information */}
                <div className="profileSelf2-top-container">
                    {/** profile image */}
                    <div className="profileSelf2-image-container" {...getRootProps()}>
                        {isImageSaveLoading ? (
                            <div className="profileSelf2-image-loader-container">
                                <div className="profileSelf2-loader-white" />
                            </div>
                        ) : (
                            <>
                                <img
                                    src={profileImage ? profileImage : profileDefaultImg}
                                    alt="Profile"
                                    onClick={handleImageClick}
                                />
                                <input
                                    {...getInputProps()}
                                    id="profself2-fileInput"
                                    type="file"
                                    style={{ display: "none" }}
                                />
                            </>
                        )}
                    </div>
                    {/** basic info */}
                    <div className="profileSelf2-basic-info-container">
                        {/** name and edit button */}
                        <div className="profileSelf2-name-and-pencil">
                            <span className="profileSelf2-name">{profile.user_name}</span>
                            <div className="profileSelf2-pencil" onClick={handleEdit}>
                                {/** no content */}
                            </div>
                        </div>
                        {/** school information */}
                        <div className="profileSelf2-row2-container">
                            <span className="profileSelf2-row2-info">{profile.school}</span>
                            <span className="profileSelf2-row2-wall">{"|"}</span>
                            <span className="profileSelf2-row2-info">
                                {profile.current_academic_degree}
                            </span>
                            <span className="profileSelf2-row2-wall">{"|"}</span>
                            <span className="profileSelf2-row2-info">
                                {profile.year % 100}학번
                            </span>
                        </div>
                        {/** major */}
                        <div className="profileSelf2-row3-container">
                            <span className="profileSelf2-row3-info">
                                {profile.major1}
                                {profile.major2 && ` ・ ${profile.major2}`}
                            </span>
                        </div>
                        {/** 1-chon */}
                        <div 
                            className="profileSelf2-row4-container"
                            onClick={() => {
                                if (profile.one_degree_count > 0) {
                                    navigate(`/profile/${id}/friends`);
                                }
                            }}
                        >
                            <span className="profileSelf2-row4-info">
                                {`1촌 ${profile.one_degree_count}명`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/** navigation bar */}
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
            {selectedNavValue === "info" && (
                <>
                <div
                    className="profileSelf2-body"
                    style={{
                        paddingTop: "28px",
                        paddingBottom: '0px'
                    }}
                >
                    {/** keywords */}
                    <div className="profileSelf2-config-title-container">
                        <span className="profileSelf2-config-title">{"관심사"}</span>
                        <span className="profileSelf2-config-title-sm">{"최대 5개"}</span>
                    </div>
                    <ItemEditor
                        type={"tag"}
                        currentItemList={profile["keywords"]}
                        setCurrentItemList={async (value) => {
                            await updateProfile("keywords", value);
                        }}
                        placeholderMsg={"본인을 나타내는 관심사를 입력해보세요."}
                        maxItemNum={5}
                        preventValueDuplication={true}
                        duplicatedValueMsg={"이미 추가한 관심사입니다."}
                    />
                </div>
                <div
                    style={{
                        marginTop: "24px",
                        padding: '0px'
                    }}
                >
                    {/** experiences */}
                    <div
                        className="profileSelf2-exp-title-add-button"
                        style={{
                            marginTop: '24px',
                            paddingLeft: '20px',
                            marginBottom: '12px'
                        }}
                    >
                        <span className="profileSelf2-config-title">{"경험"}</span>
                        <button
                            className="profileSelf2-exp-add-button"
                            onClick={() => navigate('/experience/add')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 1V11" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <path d="M11 6L1 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    <ExperienceView
                        userId={id}
                        updateTrigger={expUpdateTrigger}
                    />
                </div>
                <div
                    className="profileSelf2-body"
                    style={{
                        paddingTop: '0px'
                    }}
                >
                    {/** skill */}
                    <div
                        className="profileSelf2-config-title-container"
                        style={{
                            marginTop: "24px",
                        }}
                    >
                        <span className="profileSelf2-config-title">{"스킬"}</span>
                    </div>
                    <ItemEditor
                        type={"string"}
                        currentItemList={profile["skills"]}
                        setCurrentItemList={async (value) => {
                            await updateProfile("skills", value);
                        }}
                        placeholderMsg={"본인이 다룰 수 있는 스킬을 추가해보세요."}
                        maxItemNum={9999}
                        preventValueDuplication={true}
                        duplicatedValueMsg={"이미 등록한 스킬입니다."}
                    />
                    {/** explanation */}
                    <div
                        className="profileSelf2-config-title-container"
                        style={{
                            marginTop: "24px",
                        }}
                    >
                        <span className="profileSelf2-config-title">{"소개"}</span>
                    </div>
                    <div className="profileSelf2-textarea-container">
                        <textarea
                            className="profileSelf2-textarea"
                            placeholder={
                                "관심 있는 분야, 이루고자 하는 목표, 전문성을 쌓기 위해 하고 있는 활동 등 본인을 설명하는 글을 자유롭게 작성해 보세요."
                            }
                            value={profile["introduction"]}
                            onChange={async (e) => {
                                await updateProfile("introduction", e.target.value);
                            }}
                        />
                    </div>
                    {/** portfolio_links */}
                    <div
                        className="profileSelf2-config-title-container"
                        style={{
                            marginTop: "24px",
                        }}
                    >
                        <span className="profileSelf2-config-title">{"포트폴리오"}</span>
                        {!isLinkValid && (
                            <span className="profileSelf2-config-title-sm itemEditor-color-red">
                                {"유효하지 않은 URL 형식이 포함되어 있습니다."}
                            </span>
                        )}
                    </div>
                    <ItemEditor
                        type={"string"}
                        currentItemList={profile["portfolio_links"]}
                        setCurrentItemList={async (value) => {
                            await updateProfile("portfolio_links", value);
                        }}
                        placeholderMsg={"포트폴리오 링크를 추가해보세요."}
                        maxItemNum={9999}
                    />
                    <button
                        id = "savebtn"
                        className={
                            "profileSelf2-save-button" +
                            (isEdited && isLinkValid ? "" : " profileSelf2-btn-disabled")
                        }
                        onClick={async () => {
                            if (isEdited && isLinkValid && !isSaveLoading) {
                                await saveProfile();
                            }
                        }}
                    >
                        {!isSaveLoading && <>{"저장"}</>}
                        {isSaveLoading && (
                            <div
                                className="profileSelf2-button-loader"
                                style={{
                                    display: "inline-block",
                                }}
                            />
                        )}
                    </button>
                    {/** popups */}
                    {isSaveSuccessPopupOpen && (
                        <MessagePopUp
                            setIsOpen={setIsSaveSuccessPopupOpen}
                            message={"저장되었습니다."}
                        />
                    )}
                    {isSaveFailPopupOpen && (
                        <MessagePopUp
                            setIsOpen={setIsSaveFailPopupOpen}
                            message={"저장에 실패했습니다."}
                        />
                    )}
                </div>
                </>
            )}
            {selectedNavValue === "project" && <ProfileSelfProject userId={id} />}
        </>
    );
};

export default ProfileSelf2;