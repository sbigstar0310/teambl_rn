import React, { useEffect, useState } from "react";
import "../../styles/Project/ProjectFriend.css";
import backIcon from "../../assets/ProfileOther/left-arrow.svg";
import { useNavigate } from "react-router-dom";
import SuggestionItem from "../../components/Suggestion/SuggestionItem";
import api from "../../api";
import KaistMajors from "../../enum/KaistMajor";

const MAX_RENDER = 99999;

const SuggestionDetail = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isOnError, setIsOnError] = useState(false);

    const [secondDegreeNum, setSecondDegreeNum] = useState(0);
    /**
     * Below 4 states will have the form ...
     * {
     *  key: number,
     *  key2: number, ...
     * }
     */
    const [sameKeywordData, setSameKeywordData] = useState({});
    const [sameMajorData, setSameMajorData] = useState({});
    const [sameExpData, setSameExpData] = useState({});
    const [sameSkillData, setSameSkillData] = useState({});
    const [maxLength, setMaxLength] = useState(0);

    const handleBack = async () => {
        navigate("/home");
    };

    /** data fetch */
    const fetchData = async () => {
        const res = await api.get("/api/new-user-suggestions/");

        /** second degree */
        let tempSecondDegreeNum = res.data.secondDegree.length;
        await setSecondDegreeNum(tempSecondDegreeNum);
        /** keyword */
        let tempSameKeywordData = res.data.keyword;
        for (let key in tempSameKeywordData) {
            if (tempSameKeywordData[key].length > 0) {
                tempSameKeywordData[key] = tempSameKeywordData[key].length;
            } else {
                delete tempSameKeywordData[key];
            }
        }
        await setSameKeywordData(tempSameKeywordData);
        /** major */
        let tempSameMajorData = res.data.major;
        for (let key in tempSameMajorData) {
            if (tempSameMajorData[key].length > 0) {
                tempSameMajorData[key] = tempSameMajorData[key].length;
            } else {
                delete tempSameMajorData[key];
            }
        }
        await setSameMajorData(tempSameMajorData);
        /** exp */
        let tempSameExpData = res.data.experience_keyword;
        for (let key in tempSameExpData) {
            if (tempSameExpData[key].length > 0) {
                tempSameExpData[key] = tempSameExpData[key].length;
            } else {
                delete tempSameExpData[key];
            }
        }
        await setSameExpData(tempSameExpData);
        /** skill */
        let tempSameSkillData = res.data.skill;
        for (let key in tempSameSkillData) {
            if (tempSameSkillData[key].length > 0) {
                tempSameSkillData[key] = tempSameSkillData[key].length;
            } else {
                delete tempSameSkillData[key];
            }
        }
        await setSameSkillData(tempSameSkillData);

        /** max length for round-robin */
        let tempMaxLength = Math.max([
            tempSecondDegreeNum,
            Object.keys(tempSameKeywordData).length,
            Object.keys(tempSameMajorData).length,
            Object.keys(tempSameExpData).length,
            Object.keys(tempSameSkillData).length,
        ]);
        let numList = [
            tempSecondDegreeNum,
            Object.keys(tempSameKeywordData).length,
            Object.keys(tempSameMajorData).length,
            Object.keys(tempSameExpData).length,
            Object.keys(tempSameSkillData).length,
        ];
        await setMaxLength(Math.max(...numList));

        try {
        } catch (error) {
            console.log(error);
            await setIsOnError(true);
            await setSecondDegreeNum(0);
            await setSameKeywordData({});
            await setSameMajorData({});
            await setSameExpData({});
            await setSameSkillData({});
            await setMaxLength(0);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSuggestion = () => {
        return Array.from({ length: maxLength }, (_, i) => i)
            .flatMap((i) => {
                let tempItems = [];
                /** skill */
                if (Object.keys(sameSkillData).length > i) {
                    tempItems.push(
                        <SuggestionItem
                            searchType="people"
                            keywordType="skill"
                            keyword={Object.keys(sameSkillData)[i]}
                            numberOfPeople={
                                sameSkillData[Object.keys(sameSkillData)[i]]
                            }
                            key={"skill" + i}
                        />
                    );
                }
                /** keyword */
                if (Object.keys(sameKeywordData).length > i) {
                    tempItems.push(
                        <SuggestionItem
                            searchType="people"
                            keywordType="keyword"
                            keyword={Object.keys(sameKeywordData)[i]}
                            numberOfPeople={
                                sameKeywordData[Object.keys(sameKeywordData)[i]]
                            }
                            key={"keyword" + i}
                        />
                    );
                }
                /** major */
                if (Object.keys(sameMajorData).length > i) {
                    tempItems.push(
                        <SuggestionItem
                            searchType="people"
                            keywordType="major"
                            keyword={Object.keys(sameMajorData)[i]}
                            numberOfPeople={
                                sameMajorData[Object.keys(sameMajorData)[i]]
                            }
                            josa={KaistMajors.from(
                                Object.keys(sameMajorData)[i]
                            ).getJosa()}
                            key={"major" + i}
                        />
                    );
                }
                /** exp */
                if (Object.keys(sameExpData).length > i) {
                    tempItems.push(
                        <SuggestionItem
                            searchType="exp"
                            keywordType="exp"
                            keyword={Object.keys(sameExpData)[i]}
                            numberOfPeople={
                                sameExpData[Object.keys(sameExpData)[i]]
                            }
                            key={"exp" + i}
                        />
                    );
                }
                if (i == maxLength - 1 && secondDegreeNum > 0) {
                    tempItems.push(
                        <SuggestionItem
                            searchType="people-second"
                            keywordType="second-chon"
                            keyword="2촌"
                            numberOfPeople={secondDegreeNum}
                        />
                    );
                }
                return tempItems;
            })
            .slice(0, MAX_RENDER);
    };

    useEffect(() => {
        fetchData();
    }, []);

    /** loading */
    if (isLoading) {
        return (
            <div className="projectFriend-loader-container">
                <div className="projectFriend-loader" />
            </div>
        );
    }

    /** error */
    if (isOnError) {
        return (
            <div className="projectFriend-body">
                <div className="projectFriend-container">
                    {/** Backward button and Title */}
                    <div className="projectFriend-title-container">
                        <button
                            className="projectFriend-backbutton"
                            onClick={async () => await handleBack()}>
                            <img src={backIcon} />
                        </button>
                    </div>
                </div>
                <div className="projectFriend-error-container">
                    {"이번주 회원 정보를 불러오는 데 실패했습니다."}
                </div>
            </div>
        );
    }

    if (
        Object.keys(sameKeywordData).length +
            Object.keys(sameMajorData).length +
            Object.keys(sameExpData).length +
            Object.keys(sameSkillData).length ===
            0 &&
        secondDegreeNum === 0
    ) {
        return null; // No suggestion
    }

    return (
        <div className="projectFriend-body">
            <div className="projectFriend-container">
                {/** top fixed area */}
                <div className="projectFriend-toparea-container top-sticky top-0px">
                    {/** Backward button and Title */}
                    <div className="projectFriend-title-container">
                        <button
                            className="projectFriend-backbutton"
                            onClick={async () => await handleBack()}>
                            <img src={backIcon} />
                        </button>
                    </div>
                </div>
                <div
                    style={{
                        marginTop: "4px",
                        marginBottom: "8px",
                    }}>
                    <span className="suggestion-detail-title">
                        {`이번주 새로운 회원 소식`}
                    </span>
                </div>
                {/** actual list view */}
                <div className="projectFriend-item-container">
                    {(maxLength > 0 || secondDegreeNum > 0) &&
                        renderSuggestion().map((item, index, arr) => {
                            const isLastItem = index === arr.length - 1;
                            return React.cloneElement(item, {
                                isLastItem: isLastItem,
                                key: item.key,
                            });
                        })}
                </div>
            </div>
        </div>
    );
};

export default SuggestionDetail;
