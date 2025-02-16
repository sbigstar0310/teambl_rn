import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RegisterAloneWelcome = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [isValidFlow, setIsValidFlow] = useState(false);
    const [isStartLoading, setIsStartLoading] = useState(false);

    const handleStart = async () => {
        if (isStartLoading) {
            return;
        }
        await setIsStartLoading(true);
        if (location?.state?.isAutoLogin) {
            /** already singed in */
            navigate(`/home`, {
                state : {
                    ...location.state,
                    isRegisterAloneDone: null,
                    isAutoLogin: null       
                }
            });
        } else {
            navigate(`/login`, {
                state : {
                    ...location.state,
                    isRegisterAloneDone: null,
                    isAutoLogin: null       
                }
            });
        }
        await setIsStartLoading(false);
    };

    /** effects */
    useEffect(() => {
        if (!isValidFlow) {
            const isProcessValid = location?.state?.isRegisterAloneDone ? location?.state?.isRegisterAloneDone : false;
            const isDataValid = location?.state?.newComerName ? true : false;
            if ((!isProcessValid) || (!isDataValid)) {
                alert("비정상적인 접근입니다.");
                navigate('/home');
                return;
            }
            setIsValidFlow(isProcessValid);
        }
    }, []);

    return (
        <div className="exp-body exp-with-pd-28">
            {/** title */}
            <div
                className='exp-inv-title-container'
            >
                <div className='exp-inv-title-row'>
                    <span className='exp-inv-title primary-color'>
                        {`${location?.state?.newComerName}`}
                    </span>
                    <span className='exp-inv-title'>
                        {`님,`}
                    </span>
                </div>
                <div className='exp-inv-title-row'>
                    <span className='exp-inv-title'>
                        {`가입을 축하합니다.`}
                    </span>
                </div>
            </div>
            {/** sub-title */}
            <div className='exp-inv-subtitle-container'>
                <span className='exp-inv-subtitle'>
                    {"이제 팀블과 함께 최적의 팀원을 탐색해 보세요!"}
                </span>
            </div>
            {/** caption */}
            <div className='exp-inv-caption-container'>
                <span className='exp-inv-caption'>
                    {"프로필을 더 자세히 작성할수록 다른 회원들과 더 쉽게 연결될 수 있습니다."}
                </span>
            </div>
            {/** buttons */}
            <div className='exp-inv-bottom-button-container'>
                <button
                    className='exp-save-button no-mg'
                    onClick={async () => await handleStart()}
                >
                    {"팀블 시작하기"}
                </button>
            </div>
        </div>
    );
};

export default RegisterAloneWelcome;