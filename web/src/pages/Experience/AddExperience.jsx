import React, { useEffect, useState } from 'react';
import "../../styles/Experience/Experience.css";
import backIcon from "../../assets/Profile/left-arrow.svg";
import majorEdit from "../../assets/Profile/majorEdit.svg";
import PeopleTagPopUp from '../../components/PeopleTagPopUp';
import ItemEditor from '../../components/ItemEditor';
import DatePicker from '../../components/DatePicker';
import api from '../../api';
import { toastText } from '../../components/Toast/Toast';
import { useLocation, useNavigate } from 'react-router-dom';

const AddExperience = () => {
    
    const location = useLocation();
    const navigate = useNavigate();
    const myId = localStorage.getItem("userId");

    /** meta */
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [isPeopleSelectPopUpOpen, setIsPeopleSelectPopUpOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isValid, setIsValid] = useState(false);

    /** data */
    const [requestBody, setRequestBody] = useState({});
    /** pre-data */
    const [keywordList, setKeywordList] = useState([]);
    const [selectedPeopleList, setSelectedPeopleList] = useState([]);
    const [skillList, setSkillList] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    /** utils */
    const updateHelper = async (key, value) => {
        await setRequestBody(prevObj => {
            let newObj = { ...prevObj };
            newObj[key] = value;
            return newObj;
        });
    };

    const removePeople = async (index) => {
        await setSelectedPeopleList(prevList => {
            let newList = [...prevList];
            newList.splice(index, 1);
            return newList;
        });
    };

    /** post a new exp */
    const postExperience = async () => {
        await setIsSaveLoading(true);

        /** generate experience */
        const requestBodyExp = {};
        // title
        requestBodyExp['title'] = requestBody['title'];

        // peoples
        let peopleIdList = [];
        if (selectedPeopleList.length > 0) {
            selectedPeopleList.forEach(peopleInfo => {
                peopleIdList.push(peopleInfo['id']);
            });
        }

        ////// 대용 추가 /////
        // pending_invitations 추가
        // let pendingInvitations = [];
        // if (selectedPeopleList.length > 0) {
        //     selectedPeopleList.forEach(peopleInfo => {
        //         pendingInvitations.push({
        //             invitee: peopleInfo['id']  // 초대된 사람의 ID
        //         });
        //     });
        // }
        // // requestBodyExp에 pending_invitations 추가
        // requestBodyExp['pending_invitations'] = pendingInvitations;
        /////////////////////

        let generatedExpId = "";
        try {
            const res = await api.post(`/api/experiences/create/`, { ...requestBodyExp });
            generatedExpId = res.data.id;
        } catch (e) {
            console.log(e);
            toastText("저장에 실패했습니다.");
            await setIsSaveLoading(false);
            return;
        }

        /** generate experience detail */
        try {
            let requestBodyExpDetail = {
                "experience": generatedExpId,
                "description": requestBody['content'],
                "tags": keywordList
            };
            if (skillList.length > 0) {
                requestBodyExpDetail['skills_used'] = skillList;
            }
            if ((startDate != null) && (endDate != null)) {
                requestBodyExpDetail['start_date'] = startDate;
                requestBodyExpDetail['end_date'] = endDate;
            }
            await api.post(`/api/experience-details/create/`, { ...requestBodyExpDetail });
        } catch (e) {
            console.log(e);
            toastText("저장에 실패했습니다.");
            await setIsSaveLoading(false);
            return;
        }

        /** generate invitations */
        if (peopleIdList.length > 0) {
            try {
                peopleIdList.forEach(async (id) => {
                    await api.post(`/api/experiences/invitations/create/`, {
                        "experience_id" : generatedExpId,
                        "invitee_id" : id
                    });
                });
            } catch (e) {
                console.log(e);
                toastText("사용자를 초대하는 데 실패했습니다.");
            }
        }

        /** get generated link */
        let generatedLink = "teambl.net";
        try {
            const res = await api.get(`/api/experience-link/${myId}/${generatedExpId}/`);
            generatedLink = res.data['link'];
        } catch (e) {
            console.log(e);
        }
        
        /** done -> move to the myProfile */
        toastText("새로운 경험을 생성했어요.");
        await setIsSaveLoading(false);
        navigate(`/experience/confirm`, {
            state : {
                ...location.state,
                gen_exp_id: generatedExpId,
                gen_exp_link: generatedLink
            }
        });
    };

    /** validation (required fields) */
    useEffect(() => {
        let validity = true;

        // name
        if ((requestBody["title"] == null) || (requestBody["title"].trim() === "")) {
            validity = validity && false;
        }

        // keyword
        if (keywordList.length < 1) {
            validity = validity && false;
        }

        // content
        if ((requestBody["content"] == null) || (requestBody["content"].trim() === "")) {
            validity = validity && false;
        }

        setIsValid(validity);
    }, [requestBody, keywordList]);

    return (
        <div className="exp-body exp-with-pd-28">
            <div className="exp-container">
                {/** Backward button */}
                <div className="exp-backward-btn-container">
                    <button
                        className="exp-backbutton"
                        onClick={() => window.history.back()}
                    >
                        <img src={backIcon} />
                    </button>
                </div>
            </div>
            {/** Title */}
            <div className='exp-title-container'>
                {"경험 작성하기"}
            </div>
            {/** -- Body -- */}
            {/** Name */}
            <div className='exp-field-title-container exp-with-mt-32'>
                <span className='exp-field-title'>
                    {"이름"}
                </span>
                <span className='exp-field-title-star'>
                    {"*"}
                </span>
            </div>
            <input
                className='exp-field-input exp-with-mt-12'
                placeholder='프로젝트 이름을 작성해 보세요.'
                value={requestBody['title'] ? requestBody['title'] : ""}
                onChange={async (e) => await updateHelper("title", e.target.value)}
            />
            {/** Project Type - TBD */}
            {/** People Tagging */}
            <div className='exp-field-title-container exp-with-mt-24'>
                <span className='exp-field-title'>
                    {"사람 태그"}
                </span>
            </div>
            <div
                className='exp-friend-container exp-with-mt-12'
                onClick={() => {
                    setIsPeopleSelectPopUpOpen(true);
                }}
            >
                <img
                    src={majorEdit}
                    alt="검색"
                />
                {
                    (selectedPeopleList.length === 0) &&
                    <div className='exp-friend-message-container'>
                        <span className='exp-friend-message exp-with-ml-8 exp-with-mb-12-5'>
                            {"경험을 함께한 사람을 태그하세요."}
                        </span>
                    </div>
                }
                {
                    (selectedPeopleList.length > 0) &&
                    <div className='exp-element-container'>
                        {
                            selectedPeopleList.map((peopleInfo, index) => (
                                <div
                                    key={peopleInfo.id}
                                    className={"exp-element addProject-with-ml-8"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {peopleInfo['user_name']}
                                    <button
                                        className="exp-remove-element"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removePeople(index);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M1.5 8.5L8.5 1.5M8.5 8.5L1.5 1.5" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                }
            </div>
            {/** 키워드 */}
            <div className='exp-field-title-container exp-with-mt-24'>
                <span className='exp-field-title'>
                    {"키워드"}
                </span>
                <span className='exp-field-title-star'>
                    {"*"}
                </span>
                <span className='exp-field-subtitle'>
                    {"최소 1개, 최대 5개"}
                </span>
            </div>
            <div className='exp-contact-container exp-with-mt-12'>
                <ItemEditor
                    type={"tag"}
                    currentItemList={keywordList}
                    setCurrentItemList={setKeywordList}
                    placeholderMsg={"경험과 연관된 키워드를 입력해주세요."}
                    maxItemNum={5}
                    preventValueDuplication={true}
                    duplicatedValueMsg={"이미 추가한 키워드입니다."}
                />
            </div>
            {/** 기간 */}
            <div className='exp-field-title-container exp-with-mt-24'>
                <span className='exp-field-title'>
                    {"기간"}
                </span>
            </div>
            <input
                className='exp-field-input exp-with-mt-12'
                placeholder='프로젝트에 참여한 기간을 작성해보세요.'
                value={
                    ((startDate != null) && (endDate != null)) ?
                        `${startDate.replaceAll('-', '.')} - ${endDate.replaceAll('-', '.')}`
                        :
                        ""
                }
                readOnly
                onClick={() => {
                    setIsDatePickerOpen(true);
                }}
            />
            {/** 사용한 스킬 */}
            <div className='exp-field-title-container exp-with-mt-24'>
                <span className='exp-field-title'>
                    {"사용한 스킬"}
                </span>
            </div>
            <div className='exp-contact-container exp-with-mt-12'>
                <ItemEditor
                    type={"string"}
                    currentItemList={skillList}
                    setCurrentItemList={setSkillList}
                    placeholderMsg={"본인이 사용한 스킬을 추가해보세요."}
                    maxItemNum={999}
                    preventValueDuplication={true}
                    duplicatedValueMsg={"이미 추가한 스킬입니다."}
                />
            </div>
            {/** 내용 */}
            <div className='exp-field-title-container exp-with-mt-24'>
                <span className='exp-field-title'>
                    {"내용"}
                </span>
                <span className='exp-field-title-star'>
                    {"*"}
                </span>
            </div>
            <div className='exp-textarea-container exp-with-mt-12'>
                <textarea
                    className='exp-textarea'
                    placeholder={"프로젝트와 관련된 내용을 자유롭게 작성해 보세요."}
                    value={requestBody["content"]}
                    onChange={async (e) => await updateHelper("content", e.target.value)}
                />
            </div>
            {/** save button */}
            <button
                className={
                    'exp-save-button'
                    + ((isValid) ? '' : ' exp-btn-disabled')
                }
                onClick={async () => {
                    if (isValid && (!isSaveLoading)) {
                        postExperience();
                    }
                }}
            >
                {
                    (!isSaveLoading) &&
                    <>{"저장"}</>
                }
                {
                    isSaveLoading &&
                    <div
                        className="exp-button-loader"
                        style={{
                            display: 'inline-block'
                        }}
                    />
                }
            </button>
            {/** 사람 태그 카드 */}
            {
                isPeopleSelectPopUpOpen &&
                <PeopleTagPopUp
                    isPopUpOpen={isPeopleSelectPopUpOpen}
                    setIsPopUpOpen={setIsPeopleSelectPopUpOpen}
                    selectedPeopleList={selectedPeopleList}
                    setSelectedPeopleList={setSelectedPeopleList}
                    maxSelectNum={999}
                    myId={localStorage.getItem("userId")}
                />
            }
            {/** date picker */}
            <DatePicker
                isOpen={isDatePickerOpen}
                setIsOpen={setIsDatePickerOpen}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />
        </div>
    );
};

export default AddExperience;