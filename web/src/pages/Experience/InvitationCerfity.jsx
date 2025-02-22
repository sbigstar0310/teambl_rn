import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import "../../styles/Experience/Experience.css";
import backIcon from "../../assets/Profile/left-arrow.svg";
import {toastText} from '../../components/Toast/Toast';
import api from '../../api';
import InfoMessage from '../../components/InfoMessage';

const InvitationCerfity = () => {

    const {invitationCode, inviter} = useParams();

    const location = useLocation();
    const navigate = useNavigate();

    /** states */
    const [isValidFlow, setIsValidFlow] = useState(false);

    const [isSendLoading, setIsSendLoading] = useState(false);

    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(null);
    const [isPasswordSame, setIsPasswordSame] = useState(null);

    const [email, setEmail] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [reInputPassword, setReInputPassword] = useState("");

    /** effects */
    useEffect(() => {
        if (!isValidFlow) {
            const isProcessValid = location?.state?.isFromExpInvitation ?
                location?.state?.isFromExpInvitation : false;
            if (!isProcessValid) {
                alert("비정상적인 접근입니다.");
                navigate('/home');
            } else {
                /** check prev status */
                if (location?.state?.fromBack) {
                    setEmail(location.state.verifiedEmail);
                    setInputCode(location.state.verifiedCode);
                    setIsCodeVerified(true);
                    setInputPassword(location.state.verifiedPassword);
                    setReInputPassword(location.state.verifiedPassword);
                }
                setIsValidFlow(true);
            }
        }
    }, []);

    useEffect(() => {
        if ((inputPassword.trim() === "") || (reInputPassword.trim() === "")) {
            return;
        }
        setIsPasswordSame(inputPassword === reInputPassword);
    }, [inputPassword, reInputPassword]);

    /** api */
    const sendCode = async () => {
        await setIsSendLoading(true);
        /** check domain */
        if (!isDomainValid(email)) {
            toastText("\"kaist.ac.kr\"도메인만 가입이 가능해요.");
            await setIsSendLoading(false);
            return;
        }
        /** check duplication */
        try {
            await api.post("/api/others/check-email/", {email});
        } catch (e) {
            if (e.response && e.response.status === 400) {
                toastText("이미 가입된 이메일이에요.");
            } else {
                console.log(e);
                toastText("이메일 확인에 실패했습니다.");
            }
            await setIsSendLoading(false);
            return;
        }
        /** generate code */
        let newCode = Math.floor(100000 + Math.random() * 900000).toString();
        /** send code */
        try {
            await api.post("/api/others/send-code-email/", {email, code: newCode});
            // debug
            // console.log(newCode);
            await setGeneratedCode(newCode);
            await setIsCodeSent(true);
            await setIsSendLoading(false);
            toastText("인증코드가 전송됐어요.");
        } catch (e) {
            console.log(e);
            toastText("인증코드 전송에 실패했습니다.");
            await setIsSendLoading(false);
            return;
        }

    };

    /** utils */
    const handleBack = () => {
        navigate(`/project-card/welcome?code=${invitationCode}`);
    };
    const isValidEmailFormat = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };
    const isDomainValid = (text) => {
        return text.endsWith("@kaist.ac.kr") || text.endsWith("@alumni.kaist.ac.kr");
    };
    const checkCode = async () => {
        await setIsCodeVerified(generatedCode === inputCode);
    };

    /** returns */
    if (!isValidFlow) {
        return (
            <div className="exp-loader-container">
                <div className="exp-loader"/>
            </div>
        );
    }

    return (
        <div className="exp-body exp-with-pd-28">
            <div className="exp-container">
                {/** Backward button */}
                <div className="exp-backward-btn-container">
                    <button
                        className="exp-backbutton"
                        onClick={() => handleBack()}
                    >
                        <img src={backIcon}/>
                    </button>
                </div>
            </div>
            {/** Title */}
            <div className='exp-title-container'>
                {"회원 가입"}
            </div>
            {/** Email */}
            <div className='exp-inv-cer-field-container mt-32'>
                <span className='exp-inv-cer-field-title'>
                    {"학교 이메일"}
                </span>
                <div className='exp-inv-cer-email-input-row'>
                    <input
                        className='exp-inv-cer-email-input exp-inv-input-dynamic'
                        readOnly={(isCodeSent || isSendLoading || isCodeVerified)}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={"이메일 입력"}
                    />
                    <button
                        className={`exp-inv-cer-email-button`
                            + `${((!isCodeSent) && (!isSendLoading) && (!isCodeVerified) && isValidEmailFormat(email)) ? ' enabled' : ''}`}
                        onClick={async () => {
                            if ((!isCodeSent) && (!isSendLoading) && (!isCodeVerified) && isValidEmailFormat(email)) {
                                await sendCode();
                            }
                        }}
                    >
                        {
                            isSendLoading ?
                                <div
                                    className="exp-button-loader"
                                    style={{
                                        display: 'inline-block'
                                    }}
                                />
                                :
                                (
                                    (isCodeSent) ?
                                        "전송됨"
                                        :
                                        "인증코드 받기"
                                )
                        }
                    </button>
                </div>
                {isCodeSent && <div className='exp-inv-cer-email-input-row'>
                    <input
                        className='exp-inv-cer-email-input exp-inv-input-dynamic'
                        readOnly={((!isCodeSent) || (isCodeVerified) || (isSendLoading))}
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder={"인증코드 입력"}
                        type={"email"}
                    />
                    <button
                        className={`exp-inv-cer-email-button`
                            + `${((isCodeSent) && (!isCodeVerified) && (!isSendLoading) && (inputCode.trim() != null)) ? ' enabled' : ''}`}
                        onClick={async () => {
                            if ((isCodeSent) && (!isCodeVerified) && (!isSendLoading) && (inputCode.trim() != null)) {
                                await checkCode();
                            }
                        }}
                    >
                        {
                            (isCodeVerified) ?
                                "확인됨"
                                :
                                "인증코드 확인"
                        }
                    </button>
                </div>}
                {
                    (isCodeVerified != null) &&
                    <InfoMessage
                        type={
                            isCodeVerified ? "good" : "bad"
                        }
                        message={
                            isCodeVerified ? "인증코드가 일치합니다." : "인증코드가 일치하지 않습니다."
                        }
                    />
                }
                {
                    (isCodeVerified == null) &&
                    <div
                        style={{
                            height: '14.5px',
                            width: '100%'
                        }}
                    >
                        {/** EMPTY */}
                    </div>
                }
            </div>
            {/** Password */}
            {isCodeVerified && <div className='exp-inv-cer-field-container mt-15'>
                <span className='exp-inv-cer-field-title'>
                    {"비밀번호"}
                </span>
                <div className='exp-inv-cer-email-input-row'>
                    <input
                        className='exp-inv-cer-email-input'
                        readOnly={!isCodeVerified}
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder={"비밀번호 입력"}
                        type={"password"}
                    />
                </div>
                <div className='exp-inv-cer-email-input-row'>
                    <input
                        className='exp-inv-cer-email-input'
                        readOnly={!isCodeVerified}
                        value={reInputPassword}
                        onChange={(e) => setReInputPassword(e.target.value)}
                        placeholder={"비밀번호 확인"}
                        type={"password"}
                    />
                </div>
                {
                    (isPasswordSame != null) &&
                    <InfoMessage
                        type={
                            isPasswordSame ? "good" : "bad"
                        }
                        message={
                            isPasswordSame ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."
                        }
                    />
                }
                {
                    (isPasswordSame == null) &&
                    <div
                        style={{
                            height: '14.5px',
                            width: '100%'
                        }}
                    >
                        {/** EMPTY */}
                    </div>
                }
            </div>}
            {/** next button */}
            {isCodeVerified && <div className='exp-inv-cer-field-container mt-20'>
                <button
                    className={`exp-save-button no-mg${((!isCodeVerified) || (!isPasswordSame)) ? ' exp-btn-disabled' : ''}`}
                    onClick={() => {
                        if (isCodeVerified && isPasswordSame) {
                            navigate(`/project-card/invitation/register/${invitationCode}/${inviter}`, {
                                state: {
                                    ...location.state,
                                    isCertified: true,
                                    verifiedEmail: email,
                                    verifiedPassword: inputPassword,
                                    verifiedCode: inputCode
                                }
                            });
                        }
                    }}
                >
                    {"다음"}
                </button>
            </div>}
        </div>
    );
};

export default InvitationCerfity;