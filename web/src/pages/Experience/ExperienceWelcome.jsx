import React, {useEffect, useMemo, useState} from 'react';
import "../../styles/Experience/Experience.css";
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import retrieveProjectCardInvitationLinkFromCode
    from "../../libs/apis/ProjectCardInvitationLink/retreiveProjectCardInvitationLinkFromCode.js";

/**
 *
 * Assume that
 * 1. The user have NOT signed in.
 * 2. The code is valid.
 *
 * */
const ExperienceWelcome = () => {
    const [searchParams] = useSearchParams();
    const invitationCode = useMemo(() => searchParams.get("code"), [searchParams]);

    const navigate = useNavigate();
    const location = useLocation();

    /** states */
    const [isLoading, setIsLoading] = useState(true);
    const [isOnError, setIsOnError] = useState(false);

    const [invInfo, setInvInfo] = useState({});
    const [projectCardId, setProjectCardId] = useState("");

    /** effects */
    useEffect(() => {
        fetchExpInfo();
    }, []);

    /** api calls */
    const fetchExpInfo = async () => {
        await setIsLoading(true);
        await setIsOnError(false);

        try {
            const invitationData = await retrieveProjectCardInvitationLinkFromCode(invitationCode);
            await setInvInfo(invitationData);
            await setProjectCardId(invitationData?.project_card?.id);
        } catch (e) {
            console.log(e);
            await setIsOnError(true);
        } finally {
            await setIsLoading(false);
        }
    };

    /** utils */

    /** add "조사" */
    const appendChosa = (text) => {
        const isHangul = (char) => /[가-힣]/.test(char);
        const isEnglish = (char) => /[a-zA-Z]/.test(char);
        const charCode = text.charCodeAt(text.length - 1);

        if (isHangul(text[text.length - 1])) {
            const consonantCode = (charCode - 44032) % 28;
            return consonantCode === 0 ? `를` : `을`;
        } else if (isEnglish(text[text.length - 1])) {
            const consonantsWithBatchim = ['b', 'c', 'd', 'g', 'k', 'l', 'm', 'n', 'p', 'q', 't'];
            const lastChar = text[text.length - 1].toLowerCase();
            const secondLastChar = text.length > 1 ? text[text.length - 2].toLowerCase() : '';

            if (text.length > 1 && secondLastChar === 'l' && lastChar === 'e') {
                return `을`;
            }

            return consonantsWithBatchim.includes(lastChar) ? `을` : `를`;
        }

        return `를`;
    };


    if (isLoading) {
        return (
            <div className="exp-loader-container">
                <div className="exp-loader"/>
            </div>
        );
    }

    if (isOnError) {
        return (
            <div className="exp-body exp-with-pd-28">
                <div className="exp-error-container">
                    {"초대 정보를 불러오는 데 실패했습니다."}
                </div>
            </div>
        );
    }

    return (
        <div className="exp-body exp-with-pd-28">
            {/** title */}
            <div
                className='exp-inv-title-container'
            >
                <div className='exp-inv-title-row'>
                    <span className='exp-inv-title primary-color'>
                        {`${invInfo['inviter']['profile']['user_name']}`}
                    </span>
                    <span className='exp-inv-title'>
                        {`님이 당신과 함께한`}
                    </span>
                </div>
                <div className='exp-inv-title-row'>
                    <span className='exp-inv-title primary-color'>
                        {`‘${invInfo['project_card']['title']}’`}
                    </span>
                    <span className='exp-inv-title'>
                        {`${appendChosa(invInfo['project_card']['title'])} 공유하려 합니다.`}
                    </span>
                </div>
            </div>
            {/** sub-title */}
            <div className='exp-inv-subtitle-container'>
                <span className='exp-inv-subtitle'>
                    {"팀원 찾기의 새로운 기준, 팀블!"}
                </span>
            </div>
            {/** caption */}
            <div className='exp-inv-caption-container'>
                <span className='exp-inv-caption'>
                    {"지금 바로 프로젝트을 기록하고 프로필을 완성하세요."}
                </span>
                <span className='exp-inv-caption'>
                    {"지인 네트워크를 통해 새로운 협업의 기회를 만날 수 있어요."}
                </span>
            </div>
            {/** buttons */}
            <div className='exp-inv-bottom-button-container'>
                <button
                    className='exp-save-button no-mg exp-btn-disabled'
                    onClick={() => navigate(`/login`, {
                        state: {
                            ...location.state,
                            isExpProcess: true,
                            expInvitationCode: invitationCode
                        }
                    })}
                >
                    {"로그인"}
                </button>
                <button
                    className='exp-save-button no-mg'
                    onClick={async () => navigate(`/project-card/invitation/certify/${invitationCode}/${invInfo['inviter']['id']}`, {
                        state: {
                            ...location.state,
                            isFromExpInvitation: true,
                            expId: projectCardId
                        }
                    })}
                >
                    {"회원가입 시작하기"}
                </button>
            </div>
        </div>
    );
};

export default ExperienceWelcome;