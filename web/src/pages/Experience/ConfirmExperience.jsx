import React, { useEffect, useRef, useState } from 'react';
import "../../styles/Experience/Experience.css";
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { toastBottomText } from '../../components/Toast/BottomToast';

const ConfirmExperience = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const myId = parseInt(localStorage.getItem("userId"));

    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    /** states */
    const [expId, setExpId] = useState(null);
    const [link, setLink] = useState(null);

    /** for QR */
    const qrCodeRef = useRef(null);

    useEffect(() => {
        if (location.state
            && (location.state['gen_exp_id'] != null)
            && (location.state['gen_exp_link'] != null)) {
            /** set states */
            setExpId(parseInt(location.state['gen_exp_id']));
            setLink(location.state['gen_exp_link']);
            /** delete navigate states */
            navigate(location.pathname,
                { state: { ...location.state, gen_exp_id: null, gen_exp_link: null, AddExp: true } });
        } else {
            if ((expId != null) && (link != null)) {
                /** already set */
                return;
            } else {
                alert("비정상적인 접근입니다.");
                naviage('/home');
                return;
            }
        }

    }, [location]);

    /** save image */
    const handleDownloadPNG = () => {
        const svg = qrCodeRef.current.querySelector('svg');

        if (svg) {
            /** SVG -> String */
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);

            /** SVG -> Canvas */
            const canvas = document.createElement('canvas');
            const size = 170; /** size of QR code */
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            /** DOM parsing */
            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                ctx.drawImage(img, 0, 0, size, size);

                /** Canvas -> .png */
                canvas.toBlob((blob) => {
                    if (blob) {
                        saveAs(blob, 'teamble_qrcode.png');
                    }
                    URL.revokeObjectURL(url); /** free memory */
                });
            };

            img.src = url;
        }
    };

    /** copy */
    const copyToClipBoard = async () => {
        try {
            await navigator.clipboard.writeText(link);
            toastBottomText("링크가 복사되었습니다.");
        } catch (err) {
            toastBottomText("복사에 실패했어요.");
        }
    };

    // only for DEV
    // useEffect(() => {
    //     setExpId(24);
    //     setLink("https://www.naver.com");
    // }, []);

    if ((expId == null) || (link == null)) {
        return (<></>);
    }

    return (
        <div
            className='exp-conf-main-container'
        >
            <span className='exp-conf-title'>
                {"경험이 추가되었습니다!"}
            </span>
            <span className='exp-conf-message exp-with-mt-48'>
                {"새로 생성된 경험은 태그된 분들에게도 공유됩니다."}
            </span>
            <span className='exp-conf-message exp-with-mt-16'>
                {"상대가 수락할 경우, 상대 프로필에 해당 경험 카드가 자동 생성됩니다."}
            </span>
            {/** link container */}
            <div
                className='exp-conf-link-container'
            >
                <span className='exp-conf-link-message exp-with-mt-30'>
                    {"혹시, 함께한 분들 중"}
                </span>
                <span className='exp-conf-link-message'>
                    {"아직 팀블 회원이 아닌 분이 계신가요?"}
                </span>
                <span className='exp-conf-link-caption exp-with-mt-12'>
                    {"링크와 QR 코드로 상대를 초대할 수 있습니다."}
                </span>
                {/** buttons */}
                <div
                    className='exp-conf-link-button-container exp-with-mt-32 exp-with-mb-28'
                >
                    {/** copy button */}
                    <button
                        className='exp-conf-link-button'
                        onClick={() => copyToClipBoard()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <g clipPath="url(#clip0_491_5613)">
                                <path d="M5.83345 7.58335C6.08396 7.91826 6.40357 8.19538 6.7706 8.3959C7.13763 8.59643 7.5435 8.71567 7.96066 8.74555C8.37783 8.77542 8.79654 8.71523 9.1884 8.56906C9.58026 8.42288 9.9361 8.19414 10.2318 7.89835L11.9818 6.14835C12.5131 5.59826 12.8071 4.86151 12.8004 4.09677C12.7938 3.33203 12.487 2.60049 11.9463 2.05972C11.4055 1.51894 10.6739 1.2122 9.9092 1.20555C9.14446 1.19891 8.40771 1.49289 7.85762 2.02419L6.85428 3.02169M8.16678 6.41669C7.91627 6.08178 7.59666 5.80466 7.22963 5.60414C6.8626 5.40361 6.45674 5.28437 6.03957 5.25449C5.6224 5.22462 5.20369 5.28481 4.81183 5.43098C4.41997 5.57716 4.06413 5.8059 3.76845 6.10169L2.01845 7.85169C1.48716 8.40178 1.19317 9.13853 1.19982 9.90327C1.20646 10.668 1.51321 11.3996 2.05398 11.9403C2.59475 12.4811 3.32629 12.7878 4.09103 12.7945C4.85577 12.8011 5.59253 12.5071 6.14262 11.9759L7.14012 10.9784" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_491_5613">
                                    <rect width="14" height="14" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <span className='exp-conf-link-button-text'>
                            {"초대 링크"}
                        </span>
                    </button>
                    {/** QR button */}
                    <button
                        className='exp-conf-link-button'
                        onClick={() => setIsQRModalOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <g clipPath="url(#clip0_491_5616)">
                                <path fillRule="evenodd" clipRule="evenodd" d="M1.77598 0.0761719C1.32516 0.0761719 0.89281 0.255258 0.574034 0.574034C0.255258 0.89281 0.0761719 1.32516 0.0761719 1.77598V3.20069C0.0761719 3.61491 0.411959 3.95069 0.826172 3.95069C1.24039 3.95069 1.57617 3.61491 1.57617 3.20069V1.77598C1.57617 1.72299 1.59722 1.67217 1.6347 1.6347C1.67217 1.59722 1.72299 1.57617 1.77598 1.57617H3.20069C3.61491 1.57617 3.95069 1.24039 3.95069 0.826172C3.95069 0.411958 3.61491 0.0761719 3.20069 0.0761719H1.77598ZM3.99577 2.74553C3.30541 2.74553 2.74577 3.30518 2.74577 3.99553V6.06849C2.74577 6.75885 3.30541 7.31849 3.99577 7.31849H6.06873C6.75908 7.31849 7.31873 6.75885 7.31873 6.06849V3.99553C7.31873 3.30517 6.75908 2.74553 6.06873 2.74553H3.99577ZM4.24577 5.81849V4.24553H5.81873V5.81849H4.24577ZM10.0492 0.826248C10.0492 0.412035 10.385 0.0762482 10.7992 0.0762482H12.2239C12.6747 0.0762482 13.1071 0.255335 13.4259 0.57411C13.7446 0.892886 13.9237 1.32524 13.9237 1.77606V3.20077C13.9237 3.61498 13.5879 3.95077 13.1737 3.95077C12.7595 3.95077 12.4237 3.61498 12.4237 3.20077V1.77606C12.4237 1.72306 12.4027 1.67224 12.3652 1.63477C12.3277 1.5973 12.2769 1.57625 12.2239 1.57625H10.7992C10.385 1.57625 10.0492 1.24046 10.0492 0.826248ZM1.57623 10.7992C1.57623 10.385 1.24045 10.0492 0.826232 10.0492C0.412019 10.0492 0.076233 10.385 0.076233 10.7992V12.2239C0.076233 12.6747 0.255319 13.1071 0.574095 13.4259C0.89287 13.7446 1.32522 13.9237 1.77604 13.9237H3.20075C3.61497 13.9237 3.95075 13.5879 3.95075 13.1737C3.95075 12.7595 3.61497 12.4237 3.20075 12.4237H1.77604C1.72305 12.4237 1.67223 12.4027 1.63476 12.3652C1.59729 12.3277 1.57623 12.2769 1.57623 12.2239V10.7992ZM13.1737 10.0492C13.5879 10.0492 13.9237 10.385 13.9237 10.7992V12.2239C13.9237 12.6747 13.7446 13.1071 13.4259 13.4259C13.1071 13.7446 12.6747 13.9237 12.2239 13.9237H10.7992C10.385 13.9237 10.0492 13.5879 10.0492 13.1737C10.0492 12.7595 10.385 12.4237 10.7992 12.4237H12.2239C12.2769 12.4237 12.3277 12.4027 12.3652 12.3652C12.4027 12.3277 12.4237 12.2769 12.4237 12.2239V10.7992C12.4237 10.385 12.7595 10.0492 13.1737 10.0492ZM4.24582 9.19006C4.24582 8.77585 3.91003 8.44006 3.49582 8.44006C3.08161 8.44006 2.74582 8.77585 2.74582 9.19006V10.5041C2.74582 10.9183 3.08161 11.2541 3.49582 11.2541H4.80991C5.22412 11.2541 5.55991 10.9183 5.55991 10.5041C5.55991 10.0899 5.22412 9.75415 4.80991 9.75415H4.24582V9.19006ZM5.70587 9.19006C5.70587 8.77585 6.04166 8.44006 6.45587 8.44006H6.99989C7.41411 8.44006 7.74989 8.77585 7.74989 9.19006V10.5041C7.74989 10.9183 7.41411 11.2541 6.99989 11.2541C6.58568 11.2541 6.24989 10.9183 6.24989 10.5041V9.91143C5.93583 9.82192 5.70587 9.53285 5.70587 9.19006ZM9.94007 3.49561C9.94007 3.08139 9.60428 2.74561 9.19007 2.74561C8.77585 2.74561 8.44007 3.08139 8.44007 3.49561V4.8097C8.44007 5.22391 8.77585 5.5597 9.19007 5.5597H10.5041C10.9184 5.5597 11.2541 5.22391 11.2541 4.8097C11.2541 4.39548 10.9184 4.0597 10.5041 4.0597H9.94007V3.49561ZM8.44007 6.99992C8.44007 6.58571 8.77585 6.24992 9.19007 6.24992H10.5041C10.9184 6.24992 11.2541 6.58571 11.2541 6.99992V7.63893C11.2541 8.05314 10.9184 8.38892 10.5041 8.38892C10.1276 8.38892 9.81595 8.1115 9.76231 7.74992H9.19007C8.77585 7.74992 8.44007 7.41414 8.44007 6.99992ZM9.94007 9.19006C9.94007 8.77585 9.60428 8.44006 9.19007 8.44006C8.77585 8.44006 8.44007 8.77585 8.44007 9.19006V10.5041C8.44007 10.9183 8.77585 11.2541 9.19007 11.2541H10.5041C10.9184 11.2541 11.2541 10.9183 11.2541 10.5041C11.2541 10.0899 10.9184 9.75415 10.5041 9.75415H9.94007V9.19006Z" fill="black" />
                            </g>
                            <defs>
                                <clipPath id="clip0_491_5616">
                                    <rect width="14" height="14" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <span className='exp-conf-link-button-text'>
                            {"QR 코드"}
                        </span>
                    </button>
                </div>
            </div>
            {
                isQRModalOpen &&
                <div
                    className='exp-conf-link-qr-overlay'
                    onClick={(e) => {
                        setIsQRModalOpen(false);
                        e.stopPropagation();
                    }}
                >
                    {/** qr code */}
                    <div
                        className='exp-conf-link-qr-content'
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        ref={qrCodeRef}
                    >
                        {/** generate qr */}
                        <QRCodeSVG
                            value={link}
                            className='exp-content-link-qr-code'
                        />
                        {/** save */}
                        {/** download button */}
                        <button
                            className='exp-content-link-qr-download-button'
                            onClick={handleDownloadPNG}
                        >
                            {"QR 코드 저장"}
                        </button>
                        {/** done */}
                        <button
                            className='exp-content-link-qr-close-button'
                            onClick={() => setIsQRModalOpen(false)}
                        >
                            {"완료"}
                        </button>
                    </div>
                </div>
            }
            <button
                className='exp-conf-link-confirm-button'
                onClick={() => {
                    navigate(`/profile/${myId}`, {
                        state: {
                            ...location.state,
                            tempTargetExpId: expId,
                            AddExp: true
                        }
                    });
                }}
            >
                {"완료"}
            </button>
        </div>
    );
};

export default ConfirmExperience;