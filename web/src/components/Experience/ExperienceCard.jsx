import React, { forwardRef, useEffect, useRef, useState } from 'react';
import "../../styles/Experience/Experience.css";
import SuspenseBox from '../SuspenseBox';
import api from '../../api';
import ConfirmPopUp from '../ConfirmPopUp';
import { toastText } from '../Toast/Toast';
import ProfileDefaultImg from "../../assets/default_profile_image.svg";
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { toastBottomText } from '../Toast/BottomToast';

const MAX_HEIGHT = 288;

/**
 * @param {string} type ^(OWNER, GUEST, INVITED)$ 
 */
const ExperienceCard = forwardRef(({ id, myId, expInfo, type, userId, updateCardList, onLoad }, ref) => {

    const navigate = useNavigate();
    const location = useLocation();

    /** ref */
    const containerRef = useRef(null);
    const qrCodeRef = useRef(null);

    /** meta */
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [isRejectLoading, setIsRejectLoading] = useState(false);
    const [isAcceptLoading, setIsAcceptLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    /** bottom sheet & qr */
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    /** confirms */
    const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
    const [isAcceptConfirmOpen, setIsAcceptConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    /** overflow */
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    /** user data (additional) */
    const [userInfoList, setUserInfoList] = useState([]);

    /** detail if exists */
    const [userDetail, setUserDetail] = useState(null);
    const [mainDetail, setMainDetail] = useState({});

    /** inviter id */
    const [inviterId, setInviterId] = useState(null);

    /** link data */
    const [invitationLink, setInvitationLink] = useState(null);

    /** deletion */
    const deleteExp = async () => {
        await setIsDeleteLoading(true);
        /** delete detail */
        try {
            let myDetail = findDetailByUserId(myId);
            if (myDetail != null) {
                await api.delete(`/api/experience-details/${myDetail['id']}/delete/`);
            }
        } catch (e) {
            console.log(e);
            toastText("삭제에 실패했습니다.");
            await setIsDeleteLoading(false);
            return;
        }
        /** pop from the "accepted_users" */
        try {
            await api.delete(`/api/experiences/${expInfo['id']}/delete/`);
        } catch (e) {
            console.log(e);
            toastText("삭제에 실패했습니다.");
            await setIsDeleteLoading(false);
            return;
        }

        toastText("경험이 삭제되었어요.");
        await updateCardList();
    };

    /** fetch data */
    const fetchUserInfo = async () => {
        if (expInfo == null) {
            return;
        }

        await setIsLoading(true);
        await setIsError(false);

        let userIdList = [
            ...expInfo['accepted_users']
        ];

        if (!userIdList.includes(expInfo['creator'])) {
            userIdList.push(expInfo['creator']);
        }

        expInfo['pending_invitations'].map(async (invitation) => {
            if (!userIdList.includes(invitation['inviter'])) {
                userIdList.push(invitation['inviter']);
            }
            if (!userIdList.includes(invitation['invitee'])) {
                userIdList.push(invitation['invitee']);
            }
        });

        /** get each user information */
        const tempUserInfoList = await Promise.all(userIdList.map(async (targetUserId) => {
            try {
                const res = await api.get(`/api/user/${targetUserId}/`);
                return { ...res.data };
            } catch (e) {
                console.log(e);
                return {
                    'id': targetUserId,
                    'user_name': '알 수 없음'
                };
            }
        }));
        await setUserInfoList(tempUserInfoList);
        await setIsLoading(false);
    };

    const fetchInvitationLink = async () => {
        if (userId == myId) {
            try {
                const res = await api.get(`/api/experience-link/${myId}/${expInfo['id']}/`);
                await setInvitationLink(res.data['link']);
            } catch (e) {
                console.log(e);
                await setInvitationLink(null);
            }
        } else {
            await setInvitationLink(null);
        }
    };

    /** accept & reject */
    const rejectInvitation = async () => {
        if (isRejectLoading) {
            return;
        }
        await setIsRejectConfirmOpen(false);
        await setIsRejectLoading(true);
        try {
            await api.post(`/api/experiences/invitations/respond/`, {
                experience_id: expInfo['id'],
                response: "reject"
            });
        } catch (e) {
            console.log(e);
            await setIsRejectLoading(false);
            toastText("초대를 거절하는 데 실패했습니다.");
        }

        await setIsRejectLoading(false);
        toastText("초대를 거절했습니다.");
        await updateCardList();
        navigate(location.pathname, {
            state: {
                ...location.state,
                tempTargetExpId: expInfo['id']
            }
        });
    };

    const acceptInvitation = async () => {
        if (isAcceptLoading) {
            return;
        }
        await setIsAcceptConfirmOpen(false);
        await setIsAcceptLoading(true);
        try {
            await api.post(`/api/experiences/invitations/respond/`, {
                experience_id: expInfo['id'],
                response: "accept"
            });
        } catch (e) {
            console.log(e);
            await setIsAcceptLoading(false);
            toastText("초대를 수락하는 데 실패했습니다.");
        }

        await setIsAcceptLoading(false);
        toastText("초대를 수락했습니다.");
        await updateCardList();
        navigate(location.pathname, {
            state: {
                ...location.state,
                tempTargetExpId: expInfo['id']
            }
        });
    };

    /** utils */
    const findDetailByUserId = (userId) => {
        if ((!expInfo)
            || (!expInfo['experience_detail'])
            || (expInfo['experience_detail'].length <= 0)) {
            return null;
        }
        for (let i = 0; i < expInfo['experience_detail'].length; i++) {
            if (userId == expInfo['experience_detail'][i]['user']) {
                return { ...expInfo['experience_detail'][i] };
            }
        }
        return null;
    };

    const findUserInfoById = (userId) => {
        if (userInfoList.length <= 0) {
            return null;
        }
        for (let i = 0; i < userInfoList.length; i++) {
            if (userId == userInfoList[i]['id']) {
                return { ...userInfoList[i] };
            }
        }
        return null;
    };

    const formatDates = (startDate, endDate) => {
        const [startYear, startMonth, startDay] = startDate.split("-");
        const [endYear, endMonth, endDay] = endDate.split("-");

        if (startYear === endYear) {
            return `${startYear.slice(2)}.${startMonth}.${startDay} - ${endMonth}.${endDay}`;
        } else {
            return `${startYear.slice(2)}.${startMonth}.${startDay} - ${endYear.slice(2)}.${endMonth}.${endDay}`;
        }
    };

    const setContainerRef = (el) => {
        if (el) {
            containerRef.current = el;
        }
        let NEW_MAX_HEIGHT = (type === "INVITED") ? (MAX_HEIGHT - 44) : MAX_HEIGHT;
        if (containerRef.current && (!isOverflowing)) {
            if (containerRef.current.scrollHeight > NEW_MAX_HEIGHT) {
                setIsOverflowing(true);
            } else {
                setIsOverflowing(false);
            }
        }
    };

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

    /** NEW : find URL */
    const VALID_DOMAIN = ['com', 'net', 'org', 'io', 'co', 'kr'];

    const findUrl = (line) => {
        const domainPattern = VALID_DOMAIN.join('|');
        const emailPattern = /\b[\w.-]+@[\w.-]+\.[a-z]{2,}\b/;
        const urlPattern = new RegExp(
            `(?:https?:\\/\\/[\\w.-]+(?:\\.[\\w.-]+)+|www\\.[\\w.-]+(?:\\.[\\w.-]+)+|\\b[\\w.-]+\\.(${domainPattern}))(?=\\b|[\\s,;.!?\\-\"'()<>{}\\[\\]]|$)`,
            'g'
        );

        let result = [];
        let remainingLine = line;

        let emailMatches = remainingLine.match(emailPattern);
        while (emailMatches) {
            const emailMatch = emailMatches[0];
            const emailIndex = remainingLine.indexOf(emailMatch);

            if (emailIndex > 0) {
                result.push({
                    text: remainingLine.slice(0, emailIndex),
                    type: 'text'
                });
            }

            result.push({
                text: emailMatch,
                type: 'link',
                url: emailMatch
            });

            remainingLine = remainingLine.slice(emailIndex + emailMatch.length);
            emailMatches = remainingLine.match(emailPattern);
        }

        const urlMatches = [...remainingLine.matchAll(urlPattern)];
        if (urlMatches.length === 0) {
            if (remainingLine) {
                result.push({
                    text: remainingLine,
                    type: 'text'
                });
            }
            return result;
        }

        let lastIndex = 0;
        urlMatches.forEach(match => {
            const urlStartIndex = match.index;
            const urlEndIndex = urlStartIndex + match[0].length;

            if (urlStartIndex > lastIndex) {
                result.push({
                    text: remainingLine.slice(lastIndex, urlStartIndex),
                    type: 'text'
                });
            }

            result.push({
                text: match[0],
                type: 'link',
                url: match[0]
            });

            lastIndex = urlEndIndex;
        });

        if (lastIndex < remainingLine.length) {
            result.push({
                text: remainingLine.slice(lastIndex),
                type: 'text'
            });
        }

        return result;
    };

    /** NEW : link enabled */
    const craftLineWithLink = (line, index) => {
        let parsedLine = findUrl(line);
        if (parsedLine.length > 0) {
            return (
                <span
                    key={index}
                    className={`projectView-content-text`
                        + `${((index + 1) === userDetail['description'].split('\n').length) ? " content-last-line" : ""}`}
                >
                    {
                        parsedLine.map((parsedTextInfo, innerIndex) => {
                            if (parsedTextInfo.type === 'text') {
                                return (
                                    <span key={innerIndex}>
                                        {parsedTextInfo.text}
                                    </span>
                                );
                            } else {
                                return (
                                    <a
                                        key={innerIndex}
                                        href={
                                            parsedTextInfo.url.includes('@') ?
                                                `mailto:${parsedTextInfo.url}`
                                                :
                                                (
                                                    parsedTextInfo.url.startsWith('http') ?
                                                        parsedTextInfo.url
                                                        :
                                                        `https://${parsedTextInfo.url}`
                                                )
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            color: '#2546F3',
                                            textDecoration: 'underline',
                                            textUnderlineOffset: '2px'
                                        }}
                                    >
                                        {parsedTextInfo.text}
                                    </a>
                                );
                            }
                        })
                    }
                </span>
            );
        } else {
            return (
                <span
                    key={index}
                    className={`projectView-content-text`
                        + `${((index + 1) === userDetail['description'].split('\n').length) ? " content-last-line" : ""}`}
                >
                    {
                        (line.length === 0) ? '⠀' : line
                    }
                </span>
            );
        }
    }

    /** copy */
    const copyToClipBoard = async () => {
        try {
            await navigator.clipboard.writeText(invitationLink);
            toastBottomText("링크가 복사되었습니다.");
        } catch (err) {
            toastBottomText("복사에 실패했어요.");
        }
    };

    useEffect(() => {
        fetchInvitationLink();
        if (userInfoList.length <= 0) {
            fetchUserInfo();
        }
        expInfo['pending_invitations'].forEach(inv => {
            if ((inv['invitee'] == myId) && (inv['status'] == 'pending')) {
                setInviterId(inv['inviter']);
            }
        });
    }, [expInfo]);

    useEffect(() => {
        setUserDetail(findDetailByUserId(userId));
        setMainDetail(findDetailByUserId(expInfo['creator']));
    }, [userId, expInfo]);

    /** just suspense boxes */
    if (isLoading) {
        return (
            <div
                className='exp-view-item-container-wrapper'
                style={{
                    height: '320px'
                }}
            >
                <div className='exp-view-item-container'>
                    <div
                        style={{
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <SuspenseBox
                            styleOv={{
                                width: '103px',
                                height: '24px',
                                display: 'inline-block'
                            }}
                        />
                    </div>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            marginTop: '10px'
                        }}
                    >
                        <SuspenseBox
                            styleOv={{
                                width: '55px',
                                height: '14px',
                                marginRight: '14px',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '20px',
                                height: '20px',
                                marginRight: '3px',
                                borderRadius: '50%',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '76px',
                                height: '14px',
                                marginRight: 'auto',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '89px',
                                height: '14px',
                                display: 'inline-block'
                            }}
                        />
                    </div>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            marginTop: '11px',
                            gap: '8px'
                        }}
                    >
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px',
                                display: 'inline-block'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px',
                                display: 'inline-block'
                            }}
                        />
                    </div>
                    <SuspenseBox
                        styleOv={{
                            width: '100%',
                            height: '176px',
                            marginTop: '24px'
                        }}
                    />
                </div>
            </div>
        );
    };

    if (isError) {
        return (
            <div className='exp-view-item-container-wrapper'>
                <div className='exp-view-item-container'>
                    <div className='exp-view-no-exp-container'>
                        <span
                            className="exp-view-exp-message"
                        >
                            {"경험 정보를 불러오는 데 실패했어요."}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className='exp-view-item-container-wrapper'
            id={id}
            style={
                (type === "INVITED") ?
                    {
                        padding: '0px 0px 16px 0px'
                    }
                    :
                    {}
            }
            onLoad={onLoad}
        >
            {
                (type === "INVITED") &&
                <div
                    className='exp-view-invitation-row'
                >
                    {/** invitation message */}
                    <span
                        className='exp-view-invitation-message'
                    >
                        <span
                            style={{
                                fontWeight: '700'
                            }}
                        >
                            {
                                inviterId ?
                                    (
                                        findUserInfoById(inviterId) ?
                                            findUserInfoById(inviterId)['user_name']
                                            :
                                            "알 수 없음"
                                    )
                                    :
                                    ""
                            }
                        </span>
                        {"님의 초대를 수락하시겠어요?"}
                    </span>
                    {/** reject button */}
                    <button
                        className='exp-view-invitation-button'
                        style={{
                            marginLeft: 'auto'
                        }}
                        onClick={() => setIsRejectConfirmOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="34" viewBox="0 0 35 34" fill="none">
                            <path d="M33.899 17C33.899 26.1931 26.3912 33.65 17.1245 33.65C7.85779 33.65 0.35 26.1931 0.35 17C0.35 7.80686 7.85779 0.35 17.1245 0.35C26.3912 0.35 33.899 7.80686 33.899 17Z" stroke="#B80000" strokeWidth="0.7" />
                            <path d="M10.6313 11L23.2229 23.5" stroke="#B80000" strokeLinecap="round" />
                            <path d="M23.7266 11L11.135 23.5" stroke="#B80000" strokeLinecap="round" />
                        </svg>
                    </button>
                    <ConfirmPopUp
                        isOpen={isRejectConfirmOpen}
                        setIsOpen={setIsRejectConfirmOpen}
                        message={`${findUserInfoById(inviterId) ? findUserInfoById(inviterId)['user_name'] : ""}님의 초대를 거절합니다.`}
                        onConfirm={async () => await rejectInvitation()}
                        onReject={() => setIsRejectConfirmOpen(false)}
                        confirmLabel={"확인"}
                        rejectLabel={"취소"}
                        isCrucial={false}
                    />
                    {/** accept button */}
                    <button
                        className='exp-view-invitation-button'
                        style={{
                            marginLeft: '14px'
                        }}
                        onClick={() => setIsAcceptConfirmOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="34" viewBox="0 0 35 34" fill="none">
                            <path d="M34.5475 17C34.5475 26.1893 26.9541 33.65 17.5732 33.65C8.19238 33.65 0.599023 26.1893 0.599023 17C0.599023 7.81066 8.19238 0.35 17.5732 0.35C26.9541 0.35 34.5475 7.81066 34.5475 17Z" stroke="#0923A9" strokeWidth="0.7" />
                            <path d="M11.4589 17.3158L15.7124 23L23.6877 11" stroke="#0923A9" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                    </button>
                    <ConfirmPopUp
                        isOpen={isAcceptConfirmOpen}
                        setIsOpen={setIsAcceptConfirmOpen}
                        message={`${findUserInfoById(inviterId) ? findUserInfoById(inviterId)['user_name'] : ""}님의 초대를 수락합니다.`}
                        onConfirm={async () => await acceptInvitation()}
                        onReject={() => setIsAcceptConfirmOpen(false)}
                        confirmLabel={"확인"}
                        rejectLabel={"취소"}
                        isCrucial={false}
                    />
                </div>
            }
            <div
                className='exp-view-item-container'
                ref={setContainerRef}
                onClick={() => {
                    if (isOverflowing && isExpanded) {
                        setIsExpanded(false);
                    }
                }}
                style={
                    (type === "INVITED") ?
                        {
                            minHeight: `${MAX_HEIGHT - 44}px`,
                            maxHeight: isOverflowing ? (isExpanded ? "none" : `${MAX_HEIGHT - 44}px`) : "none",
                            transition: "all 0.2s ease",
                            justifyContent: 'flex-start',
                            padding: '16px 16px 0px 16px'
                        }
                        :
                        {
                            minHeight: `${MAX_HEIGHT}px`,
                            maxHeight: isOverflowing ? (isExpanded ? "none" : `${MAX_HEIGHT}px`) : "none",
                            transition: "all 0.2s ease",
                            justifyContent: 'flex-start'
                        }
                }
            >
                <div
                    className='exp-view-item-container'
                >
                    {/** COMMON fields */}
                    <div
                        className='exp-view-content-area'
                    >
                        {/** title (+ edit button) */}
                        <div
                            className='exp-view-row'
                        >
                            <span
                                className='exp-view-item-title'
                            >
                                {expInfo['title']}
                            </span>
                            {
                                (type !== "INVITED") && (userId == myId) &&
                                <button
                                    className='exp-view-invitation-button-option'
                                    onClick={() => setIsBottomSheetOpen(true)}
                                    style={{
                                        marginLeft: 'auto'
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="4" viewBox="0 0 18 4" fill="none">
                                        <circle cx="2" cy="2" r="2" fill="#595959" />
                                        <circle cx="9" cy="2" r="2" fill="#595959" />
                                        <circle cx="16" cy="2" r="2" fill="#595959" />
                                    </svg>
                                </button>
                            }
                        </div>
                        {/** bottom sheet */}
                        {
                            isBottomSheetOpen &&
                            <div
                                className='exp-bottom-sheet-overlay'
                                onClick={(e) => {
                                    setIsBottomSheetOpen(false);
                                    e.stopPropagation();
                                }}
                            >
                                <div
                                    className='exp-bottom-sheet-content'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <div
                                        className='exp-bottom-sheet-handle'
                                    >
                                        {/** NO CONTENT */}
                                    </div>
                                    <div
                                        className='exp-bottom-sheet-button-area'
                                    >
                                        {/** copy link */}
                                        {
                                            (myId == expInfo['creator']) && (invitationLink != null) &&
                                            <div
                                                className='exp-bottom-sheet-item'
                                            >
                                                <button
                                                    className='exp-bottom-sheet-button'
                                                    onClick={() => copyToClipBoard()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <g clipPath="url(#clip0_505_1095)">
                                                            <path d="M9.99996 13C10.4294 13.5742 10.9773 14.0492 11.6065 14.393C12.2357 14.7367 12.9315 14.9411 13.6466 14.9924C14.3617 15.0436 15.0795 14.9404 15.7513 14.6898C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4507 9.59702 21.9547 8.334 21.9433 7.02302C21.9319 5.71204 21.4061 4.45797 20.479 3.53093C19.552 2.60389 18.2979 2.07805 16.987 2.06666C15.676 2.05526 14.413 2.55924 13.47 3.47003L11.75 5.18003M14 11C13.5705 10.4259 13.0226 9.95084 12.3934 9.60709C11.7642 9.26333 11.0684 9.05891 10.3533 9.00769C9.63816 8.95648 8.92037 9.05966 8.24861 9.31025C7.57685 9.56083 6.96684 9.95296 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3962 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke="#121212" strokeWidth="2.74286" strokeLinecap="round" strokeLinejoin="round" />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_505_1095">
                                                                <rect width="24" height="24" fill="white" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </button>
                                                <span
                                                    className='exp-bottom-sheet-item-text'
                                                >
                                                    {"공유 링크"}
                                                </span>
                                            </div>
                                        }
                                        {/** QR view */}
                                        {
                                            (myId == expInfo['creator']) && (invitationLink != null) &&
                                            <div
                                                className='exp-bottom-sheet-item'
                                            >
                                                <button
                                                    className='exp-bottom-sheet-button'
                                                    onClick={() => {
                                                        setIsBottomSheetOpen(false);
                                                        setIsQRModalOpen(true);
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <g clipPath="url(#clip0_505_1101)">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M3.04457 0.130676C2.27173 0.130676 1.53057 0.437681 0.984094 0.984154C0.437621 1.53063 0.130615 2.2718 0.130615 3.04463V5.48699C0.130615 6.19708 0.706249 6.77271 1.41633 6.77271C2.12642 6.77271 2.70204 6.19708 2.70204 5.48699V3.04463C2.70204 2.95379 2.73812 2.86667 2.80237 2.80244C2.86661 2.73819 2.95373 2.7021 3.04457 2.7021H5.48693C6.19702 2.7021 6.77264 2.12648 6.77264 1.41639C6.77264 0.70631 6.19702 0.130676 5.48693 0.130676H3.04457ZM6.84992 4.70672C5.66645 4.70672 4.70707 5.66612 4.70707 6.84957V10.4032C4.70707 11.5867 5.66645 12.5461 6.84992 12.5461H10.4036C11.587 12.5461 12.5464 11.5867 12.5464 10.4032V6.84957C12.5464 5.6661 11.587 4.70672 10.4036 4.70672H6.84992ZM7.27849 9.97465V7.27815H9.975V9.97465H7.27849ZM17.2272 1.41652C17.2272 0.706442 17.8029 0.130807 18.513 0.130807H20.9553C21.7281 0.130807 22.4694 0.437813 23.0159 0.984284C23.5622 1.53076 23.8692 2.27193 23.8692 3.04477V5.48713C23.8692 6.1972 23.2936 6.77284 22.5835 6.77284C21.8735 6.77284 21.2978 6.1972 21.2978 5.48713V3.04477C21.2978 2.95391 21.2618 2.86679 21.1975 2.80256C21.1332 2.73832 21.0462 2.70224 20.9553 2.70224H18.513C17.8029 2.70224 17.2272 2.1266 17.2272 1.41652ZM2.70214 18.5131C2.70214 17.803 2.12652 17.2274 1.41643 17.2274C0.706354 17.2274 0.13072 17.803 0.13072 18.5131V20.9554C0.13072 21.7282 0.437725 22.4695 0.984198 23.016C1.53067 23.5623 2.27184 23.8694 3.04467 23.8694H5.48703C6.19712 23.8694 6.77275 23.2937 6.77275 22.5836C6.77275 21.8736 6.19712 21.2979 5.48703 21.2979H3.04467C2.95383 21.2979 2.86671 21.2619 2.80248 21.1976C2.73824 21.1334 2.70214 21.0463 2.70214 20.9554V18.5131ZM22.5835 17.2274C23.2936 17.2274 23.8692 17.803 23.8692 18.5131V20.9554C23.8692 21.7282 23.5622 22.4695 23.0159 23.016C22.4694 23.5623 21.7281 23.8694 20.9553 23.8694H18.513C17.8029 23.8694 17.2272 23.2937 17.2272 22.5836C17.2272 21.8736 17.8029 21.2979 18.513 21.2979H20.9553C21.0462 21.2979 21.1332 21.2619 21.1975 21.1976C21.2618 21.1334 21.2978 21.0463 21.2978 20.9554V18.5131C21.2978 17.803 21.8735 17.2274 22.5835 17.2274ZM7.27858 15.7545C7.27858 15.0444 6.70294 14.4688 5.99287 14.4688C5.28279 14.4688 4.70715 15.0444 4.70715 15.7545V18.0072C4.70715 18.7172 5.28279 19.2929 5.99287 19.2929H8.24559C8.95567 19.2929 9.53131 18.7172 9.53131 18.0072C9.53131 17.2971 8.95567 16.7215 8.24559 16.7215H7.27858V15.7545ZM9.78152 15.7545C9.78152 15.0444 10.3572 14.4688 11.0672 14.4688H11.9998C12.7099 14.4688 13.2856 15.0444 13.2856 15.7545V18.0072C13.2856 18.7172 12.7099 19.2929 11.9998 19.2929C11.2898 19.2929 10.7141 18.7172 10.7141 18.0072V16.9911C10.1757 16.8377 9.78152 16.3421 9.78152 15.7545ZM17.0402 5.99257C17.0402 5.28248 16.4645 4.70685 15.7544 4.70685C15.0443 4.70685 14.4687 5.28248 14.4687 5.99257V8.24529C14.4687 8.95537 15.0443 9.53101 15.7544 9.53101H18.0071C18.7173 9.53101 19.2928 8.95537 19.2928 8.24529C19.2928 7.5352 18.7173 6.95958 18.0071 6.95958H17.0402V5.99257ZM14.4687 12C14.4687 11.2899 15.0443 10.7142 15.7544 10.7142H18.0071C18.7173 10.7142 19.2928 11.2899 19.2928 12V13.0954C19.2928 13.8055 18.7173 14.3811 18.0071 14.3811C17.3616 14.3811 16.8274 13.9055 16.7354 13.2857H15.7544C15.0443 13.2857 14.4687 12.71 14.4687 12ZM17.0402 15.7545C17.0402 15.0444 16.4645 14.4688 15.7544 14.4688C15.0443 14.4688 14.4687 15.0444 14.4687 15.7545V18.0072C14.4687 18.7172 15.0443 19.2929 15.7544 19.2929H18.0071C18.7173 19.2929 19.2928 18.7172 19.2928 18.0072C19.2928 17.2971 18.7173 16.7215 18.0071 16.7215H17.0402V15.7545Z" fill="black" />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_505_1101">
                                                                <rect width="24" height="24" fill="white" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </button>
                                                <span
                                                    className='exp-bottom-sheet-item-text'
                                                >
                                                    {"QR 코드"}
                                                </span>
                                            </div>
                                        }
                                        {/** edit */}
                                        <div
                                            className='exp-bottom-sheet-item'
                                        >
                                            <button
                                                className='exp-bottom-sheet-button'
                                                onClick={() => navigate(`/experience/${expInfo['id']}/edit`)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <g clipPath="url(#clip0_505_1107)">
                                                        <path d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z" stroke="#1E1E1E" strokeWidth="2.74" strokeLinecap="round" strokeLinejoin="round" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_505_1107">
                                                            <rect width="24" height="24" fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                            </button>
                                            <span
                                                className='exp-bottom-sheet-item-text'
                                            >
                                                {"수정"}
                                            </span>
                                        </div>
                                        {/** delete */}
                                        <div
                                            className='exp-bottom-sheet-item'
                                        >
                                            <button
                                                className='exp-bottom-sheet-button exp-bottom-sheet-item-red'
                                                onClick={() => {
                                                    if (isDeleteLoading) {
                                                        return;
                                                    }
                                                    setIsBottomSheetOpen(false);
                                                    setIsDeleteConfirmOpen(true);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 6H5M5 6H21M5 6V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M10 11V17M14 11V17" stroke="#B80000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <span
                                                className='exp-bottom-sheet-item-text exp-bottom-sheet-item-red'
                                            >
                                                {"삭제"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        {/** delete confirmation */}
                        {
                            isDeleteConfirmOpen &&
                            <ConfirmPopUp
                                isOpen={isDeleteConfirmOpen}
                                setIsOpen={setIsDeleteConfirmOpen}
                                message={"경험을 정말 삭제하시겠습니까?"}
                                onConfirm={deleteExp}
                                onReject={() => setIsDeleteConfirmOpen(false)}
                                confirmLabel={"경험 삭제"}
                                rejectLabel={"취소"}
                                isCrucial={true}
                            />
                        }
                        {/** collaborators + date(CAUTION! - detail field!) */}
                        <div
                            className='exp-view-row'
                            style={{
                                marginTop: '10px'
                            }}
                        >
                            <img
                                className='exp-view-item-profile-image'
                                src={
                                    findUserInfoById(userId)?.profile?.image ?
                                        findUserInfoById(userId)?.profile?.image
                                        :
                                        ProfileDefaultImg
                                }
                                onClick={() => {
                                    navigate(`/experience/${userId}/${expInfo['id']}/people`, { state: { ...location.state, fromProfileId: userId } });
                                }}
                            />
                            <span
                                className='exp-view-item-name'
                                style={{
                                    marginLeft: '4px'
                                }}
                                onClick={() => {
                                    navigate(`/experience/${userId}/${expInfo['id']}/people`, { state: { ...location.state, fromProfileId: userId } });
                                }}
                            >
                                {
                                    (expInfo['accepted_users'] &&
                                        expInfo['accepted_users'].includes(parseInt(userId))) ?
                                        findUserInfoById(userId)?.user_name
                                        :
                                        findUserInfoById(expInfo['creator'])?.user_name
                                }
                            </span>
                            {
                                expInfo['accepted_users'] &&
                                (expInfo['accepted_users'].length > 1) &&
                                <span
                                    className='exp-view-item-name'
                                    onClick={() => {
                                        navigate(`/experience/${userId}/${expInfo['id']}/people`, { state: { ...location.state, fromProfileId: userId } });
                                    }}
                                >
                                    {`님 외 ${expInfo['accepted_users'].length - 1}명`}
                                </span>
                            }
                            {
                                userDetail && userDetail['start_date'] && userDetail['end_date'] &&
                                <span
                                    className='exp-view-item-date'
                                    style={{
                                        marginLeft: 'auto'
                                    }}
                                >
                                    {formatDates(userDetail['start_date'], userDetail['end_date'])}
                                </span>
                            }
                            {
                                !(userDetail && userDetail['start_date'] && userDetail['end_date']) &&
                                mainDetail && mainDetail['start_date'] && mainDetail['end_date'] &&
                                <span
                                    className='exp-view-item-date'
                                    style={{
                                        marginLeft: 'auto'
                                    }}
                                >
                                    {formatDates(mainDetail['start_date'], mainDetail['end_date'])}
                                </span>
                            }
                        </div>
                        {/** tags */}
                        {
                            userDetail && userDetail['tags'] && (userDetail['tags'].length > 0) &&
                            <div
                                className='exp-view-row'
                                style={{
                                    marginTop: '10px',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}
                            >
                                {
                                    userDetail['tags'].map((tag, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className='exp-view-tag-item'
                                            >
                                                {tag}
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        }
                        {
                            !(userDetail && userDetail['tags'] && (userDetail['tags'].length > 0)) &&
                            mainDetail && mainDetail['tags'] && (mainDetail['tags'].length > 0) &&
                            <div
                                className='exp-view-row'
                                style={{
                                    marginTop: '10px',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}
                            >
                                {
                                    mainDetail['tags'].map((tag, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className='exp-view-tag-item'
                                            >
                                                {tag}
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        }
                        {/** PERSONAL fields */}
                        {/** skills if exists */}
                        {
                            userDetail && userDetail['skills_used'] && (userDetail['skills_used'].length > 0) &&
                            <>
                                <div
                                    className='exp-view-row'
                                    style={{
                                        marginTop: '24px',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <span
                                        className='exp-view-field-title'
                                    >
                                        {"사용한 스킬"}
                                    </span>
                                </div>
                                <div
                                    className='exp-view-row'
                                    style={{
                                        marginTop: '12px',
                                        flexWrap: 'wrap',
                                        gap: '8px'
                                    }}
                                >
                                    {
                                        userDetail['skills_used'].map((skill, index) => {
                                            return (
                                                <div
                                                    key={index}
                                                    className='exp-view-skill-item'
                                                >
                                                    {skill}
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </>
                        }
                        {/** description if exists */}
                        {
                            userDetail && userDetail['description'] &&
                            <>
                                <div
                                    className='exp-view-row'
                                    style={{
                                        marginTop: '24px',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <span
                                        className='exp-view-field-title'
                                    >
                                        {"소개"}
                                    </span>
                                </div>
                                <div
                                    className='exp-view-description-container'
                                    style={{
                                        marginTop: '12px'
                                    }}
                                >
                                    {
                                        userDetail['description'] &&
                                        userDetail['description'].split('\n').map((line, index) => {
                                            return craftLineWithLink(line, index);
                                        })
                                    }
                                </div>
                            </>
                        }
                        {
                            !(userDetail && userDetail['description']) &&
                            mainDetail && mainDetail['description'] &&
                            <>
                                <div
                                    className='exp-view-row'
                                    style={{
                                        marginTop: '24px',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <span
                                        className='exp-view-field-title'
                                    >
                                        {"소개"}
                                    </span>
                                </div>
                                <div
                                    className='exp-view-description-container'
                                    style={{
                                        marginTop: '12px'
                                    }}
                                >
                                    {
                                        mainDetail['description'].split('\n').map((line, index) => {
                                            return (
                                                <span
                                                    key={index}
                                                    className='exp-view-description-line'
                                                >
                                                    {line}
                                                </span>
                                            );
                                        })
                                    }
                                </div>
                            </>
                        }
                        {/** overflow */}
                        {
                            isOverflowing && (!isExpanded) &&
                            <button
                                className='exp-expand-button'
                                onClick={() => setIsExpanded((prev) => !prev)}
                            >
                                {"전체 보기"}
                            </button>
                        }
                    </div>
                </div>
            </div>
            {/** QR Modal */}
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
                            value={invitationLink}
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
        </div>
    );
});

export default ExperienceCard;