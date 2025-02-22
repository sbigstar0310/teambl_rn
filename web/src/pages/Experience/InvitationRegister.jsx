import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import backIcon from "../../assets/Profile/left-arrow.svg";
import majorEdit from "../../assets/Profile/majorEdit.svg";
import "../../styles/ProfilePage/EditProfile.css";
import "../../styles/Experience/Experience.css";
import MajorPopUp from '../NewSearchPage/MajorPopUp';
import { toastText } from '../../components/Toast/Toast';
import { toastBottomText } from '../../components/Toast/BottomToast';
import CurrentAcademicDegreePopUp from '../ProfilePage/CurrentAcademicDegreePopUp';
import api from '../../api';
import ItemEditor from '../../components/ItemEditor';
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

const InvitationRegister = () => {

    const { invitationCode, inviter } = useParams();

    const navigate = useNavigate();
    const location = useLocation();

    /** states */
    const [isValidFlow, setIsValidFlow] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);

    const [isMajorPopUp, setIsMajorPopUp] = useState(false);
    const [isCADPopUp, setIsCADPopUp] = useState(false);

    const [passedCode, setPassedCode] = useState("");
    const [passedEmail, setPassedEmail] = useState("");
    const [passedPassword, setPassedPassword] = useState("");
    const [name, setName] = useState("");
    const [school, setSchool] = useState("카이스트");
    const [academicDegree, setAcademicDegree] = useState("");
    const [year, setYear] = useState("");
    const [majorList, setMajorList] = useState([]);
    const [keywordList, setKeywordList] = useState([]);

    /** effects */
    useEffect(() => {
        if (!isValidFlow) {
            let isProcessValid = location?.state?.isCertified ?
                location?.state?.isCertified : false;
            isProcessValid = isProcessValid && (location?.state?.expId != null);
            const givenEmail = location?.state?.verifiedEmail ?
                location?.state?.verifiedEmail : "";
            const givenPassword = location?.state?.verifiedPassword ?
                location?.state?.verifiedPassword : "";
            const givenCode = location?.state?.verifiedCode ?
                location?.state?.verifiedCode : "";
            const isDataValid = (givenEmail.trim() !== "") && (givenPassword.trim() !== "") && (givenCode.trim() !== "");
            if ((!isProcessValid) || (!isDataValid)) {
                alert("비정상적인 접근입니다.");
                navigate('/home');
            } else {
                setPassedEmail(givenEmail);
                setPassedPassword(givenPassword);
                setPassedCode(givenCode);
                setIsValidFlow(true);
            }
        }
    }, []);

    /** validate */
    useEffect(() => {
        const isNameValid = (name.trim() !== "");
        const isScoolValid = (school.trim() !== "");
        const isAcademicDegreeValid = (academicDegree.trim() !== "");
        const isYearValid = checkIsValidYear(year);
        const isMajorValid = (majorList.length >= 1) && (majorList.length <= 2);
        const isKeywordValid = (keywordList.length >= 2);

        setIsValid(
            isNameValid &&
            isScoolValid &&
            isAcademicDegreeValid &&
            isYearValid &&
            isMajorValid &&
            isKeywordValid
        );
    }, [name, school, academicDegree, year, majorList, keywordList]);

    /** api */
    const registerUser = async () => {
        await setIsSaveLoading(true);

        try {
            await api.post(`/api/user/register-project-card/`, craftRequestBody());
            /** auto login */
            try {
                const res = await api.post('/api/token/', {
                    email: passedEmail,
                    password: passedPassword
                });
                await localStorage.setItem(ACCESS_TOKEN, res.data.access);
                await localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                await localStorage.setItem("userId", res.data.userId);
                console.log("Stored userId:", localStorage.getItem("userId"));
                navigate('/project-card/invitation/register/welcome', {
                    state: {
                        ...location.state,
                        isNewComer: true,
                        newComerName: name,
                        invitationCode: invitationCode,
                        expTargetUser: res.data.id,
                        autoLoginSuccess: true
                    }
                });
            } catch (e) {
                /** failed to auto login */
                console.log(e);
                navigate('/project-card/invitation/register/welcome', {
                    state: {
                        ...location.state,
                        isNewComer: true,
                        newComerName: name,
                        invitationCode: invitationCode,
                        expTargetUser: res.data.id,
                        autoLoginSuccess: false
                    }
                });
            }
        } catch (e) {
            console.log(e);
            toastText("가입에 실패했어요.");
        } finally {
            await setIsSaveLoading(false);
        }
    };

    /** utils */
    const handleBack = () => {
        navigate(`/project-card/invitation/certify/${invitationCode}/${inviter}`, {
            state: {
                ...location.state,
                fromBack: true,
                isFromExpInvitation: true,
                verifiedEmail: passedEmail,
                verifiedPassword: passedPassword,
                verifiedCode: passedCode
            }
        });
    };
    const handleRemoveMajor = (majorToRemove) => {
        setMajorList((prevMajors) =>
            prevMajors.filter((major) => major !== majorToRemove)
        );
    };
    const handleMajorChange = (selectedMajors) => {
        if (selectedMajors.length <= 2) {
            setMajorList(selectedMajors);
        } else {
            toastBottomText("전공은 최대 2개까지 선택할 수 있습니다.");
        }
    };
    const checkIsValidYear = (value) => {
        const year = Number(value);

        if (isNaN(year) || year < 1000 || year > 9999) {
            return false;
        }

        return Number.isInteger(year);
    };
    const craftRequestBody = () => {
        let newRequestBody = {};
        newRequestBody['inviter_id'] = inviter;
        newRequestBody['email'] = passedEmail;
        newRequestBody['password'] = passedPassword;
        newRequestBody['profile'] = {
            'user_name': name,
            'school': school,
            'current_academic_degree': academicDegree,
            'year': year,
            'major1': majorList[0],
            'major2': (majorList.length > 1) ? majorList[1] : "",
            'keywords': keywordList
        };
        newRequestBody['code'] = invitationCode;
        newRequestBody['project_card_id'] = location?.state?.expId;
        return newRequestBody;
    };

    /** returns */
    if (!isValidFlow) {
        return (
            <div className="exp-loader-container">
                <div className="exp-loader" />
            </div>
        );
    }

    return (
        <div className='exp-body exp-with-pd-28'>
            <div className="exp-container">
                {/** Backward button */}
                <div className="exp-backward-btn-container">
                    <button
                        className="exp-backbutton"
                        onClick={() => handleBack()}
                    >
                        <img src={backIcon} />
                    </button>
                </div>
            </div>
            {/** Title */}
            <div className='exp-title-container'>
                {"프로필 작성하기"}
            </div>
            {/** Name */}
            <div className='exp-inv-cer-field-container mt-32'>
                <span className='exp-inv-cer-field-title'>
                    {"이름"}
                </span>
                <div className='exp-inv-cer-email-input-row'>
                    <input
                        className='exp-inv-cer-email-input'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={"이름 입력"}
                        readOnly={isSaveLoading}
                    />
                </div>
            </div>
            {/** Name */}
            <div className='exp-inv-cer-field-container mt-20'>
                <span className='exp-inv-cer-field-title'>
                    {"학교"}
                </span>
                <div className='exp-inv-cer-email-input-row'>
                    <input
                        className='exp-inv-cer-email-input'
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder={"학교 입력"}
                        readOnly
                    />
                </div>
            </div>
            {/** Keyword */}
            <div className='exp-inv-cer-field-container mt-20'>
                <div className='exp-inv-cer-field-title-container'>
                    <span className='exp-inv-cer-field-title'> {"관심사"} </span>
                    <span className="exp-inv-cer-field-title-sm">{"최소 2개, 최대 5개"}</span>
                </div>
                <ItemEditor
                    type={"tag"}
                    currentItemList={keywordList}
                    setCurrentItemList={async (value) => setKeywordList(value)}
                    placeholderMsg={"본인을 나타내는 관심사를 입력해보세요."}
                    maxItemNum={5}
                    preventValueDuplication={true}
                    duplicatedValueMsg={"이미 추가한 관심사입니다."}
                />
                {/* {
                    (keywordList.length === 1) &&
                    <InfoMessage
                        type={"bad"}
                        message={"관심사는 2개 이상 입력해야 합니다."}
                    />
                } */}
            </div>
            {/** Academic Degree */}
            <div className='exp-inv-cer-field-container mt-20'>
                <span className='exp-inv-cer-field-title'>
                    {"재학 과정"}
                </span>
                <div className='exp-inv-cer-email-input-row'>
                    <input
                        className='exp-inv-cer-acadegree-input'
                        value={academicDegree}
                        placeholder={"재학 과정 입력"}
                        onClick={() => {
                            if (!isSaveLoading) {
                                setIsCADPopUp(true);
                            }
                        }}
                        readOnly
                    />
                </div>
                {
                    isCADPopUp &&
                    <CurrentAcademicDegreePopUp
                        cad={academicDegree}
                        setCad={setAcademicDegree}
                        setIsPopupOpen={setIsCADPopUp}
                    />
                }
            </div>
            {/** Year */}
            <div className='exp-inv-cer-field-container mt-20'>
                <span className='exp-inv-cer-field-title'>
                    {"입학년도"}
                </span>
                <div className='exp-inv-cer-email-input-row'>
                    <input
                        className='exp-inv-cer-email-input'
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder={"입학년도 입력 (4자리)"}
                        readOnly={isSaveLoading}
                    />
                </div>
            </div>
            {/** Major */}
            <div className='exp-inv-cer-field-container mt-20'>
                <span className='exp-inv-cer-field-title'>
                    {"전공"}
                </span>
                <div className='exp-inv-cer-email-input-row'>
                    <div
                        className="major-list"
                        onClick={() => {
                            if (!isSaveLoading) {
                                setIsMajorPopUp(true);
                            }
                        }}
                        style={{
                            width: '100%',
                            height: '40px',
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            marginTop: '0px'
                        }}
                    >
                        <img
                            src={majorEdit}
                            alt="전공 선택"
                            className="edit-addMajorImg"
                            onClick={() => {
                                if (!isSaveLoading) {
                                    setIsMajorPopUp(true);
                                }
                            }}
                        />
                        {majorList.length === 0 ? (
                            <span className="exp-inv-placeholder-text">
                                전공 검색
                            </span>
                        ) : (
                            majorList.map((major, index) => (
                                <div
                                    key={index}
                                    className="major-element"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {major}
                                    <button
                                        className="newSearch-remove-major"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMajor(major);
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <MajorPopUp
                    isMajorPopupOpen={isMajorPopUp}
                    userSelectedMajors={majorList}
                    handleMajorChange={handleMajorChange}
                    setIsMajorPopupOpen={setIsMajorPopUp}
                    doSearchUsers={() => { }}
                    buttonText={"선택 완료"}
                />
            </div>
            {/** Button */}
            <div className='exp-inv-cer-field-container mt-18'>
                <button
                    className={`exp-save-button no-mg${((!isValid) || (isSaveLoading)) ? ' exp-btn-disabled' : ''}`}
                    onClick={async () => {
                        if (isValid && (!isSaveLoading)) {
                            await registerUser();
                        }
                    }}
                >
                    {
                        isSaveLoading ?
                            <div
                                className="exp-button-loader"
                                style={{
                                    display: 'inline-block'
                                }}
                            />
                            :
                            "완료"
                    }
                </button>
            </div>
        </div>
    );
};

export default InvitationRegister;