import React from 'react';
import "../../styles/Suggestion/Suggestion.css";
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * ‘’
 * @param {Object} props
 * @param {string} props.searchType - ^(people-second | people | exp)$
 * @param {string} props.keywordType - ^(second-chon | keyword | major | exp | skill)$
 * @param {string} props.keyword
 * @param {number} props.numberOfPeople
 * @param {string} props.josa - Required value when `keywordType` is `major`
 * @param {boolean} [props.isLastItem=false]
 */
const SuggestionItem = ({ searchType, keywordType, keyword, numberOfPeople, josa, isLastItem = false }) => {

    const navigate = useNavigate();
    const location = useLocation();

    const gotoIcon = () => {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="6"
                height="10"
                viewBox="0 0 6 10"
                fill="none"
                style={{
                    marginLeft: "6px"
                }}
            >
                <path d="M1 9L5 5L1 1" stroke="#595959" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    const renderItem = () => {
        if (keywordType === "second-chon") {
            return (
                <div className='suggestion-item'>
                    {"새로운 "}
                    <span className='strong-word'>
                        {keyword}
                    </span>
                    {"이 "}
                    <span className='strong-word'>
                        {`${numberOfPeople}명`}
                    </span>
                    {" 늘어났어요"}
                    {gotoIcon()}
                </div>
            );
        } else if (keywordType === "keyword") {
            return (
                <div className='suggestion-item'>
                    <span className='strong-word'>
                        {`‘${keyword}’`}
                    </span>
                    {"에 관심을 가진 회원이 "}
                    <span className='strong-word'>
                        {`${numberOfPeople}명`}
                    </span>
                    {" 늘어났어요"}
                    {gotoIcon()}
                </div>
            );
        } else if (keywordType === "major") {
            return (
                <div className='suggestion-item'>
                    <span className='strong-word'>
                        {`‘${keyword}’`}
                    </span>
                    {`${josa} 전공하는 회원이 `}
                    <span className='strong-word'>
                        {`${numberOfPeople}명`}
                    </span>
                    {" 늘어났어요"}
                    {gotoIcon()}
                </div>
            );
        } else if (keywordType === "skill") {
            return (
                <div className='suggestion-item'>
                    <span className='strong-word'>
                        {`‘${keyword}’`}
                    </span>
                    {" 스킬을 가진 회원이 "}
                    <span className='strong-word'>
                        {`${numberOfPeople}명`}
                    </span>
                    {" 늘어났어요"}
                    {gotoIcon()}
                </div>
            );
        } else { /** exp */
            if (!keyword) {
                return null; // keyword가 null일 경우 아무것도 렌더링하지 않음
            }
            
            return (
                <div className='suggestion-item'>
                    <span className='strong-word'>
                        {`‘${keyword}’`}
                    </span>
                    {" 관련 경험을 한 회원이 "}
                    <span className='strong-word'>
                        {`${numberOfPeople}명`}
                    </span>
                    {" 늘어났어요"}
                    {gotoIcon()}
                </div>
            );
        }
    };

    return (
        <div
            className={`suggestion-item-container ${isLastItem ? "last-item" : ""}`}
            onClick={() => {
                if (searchType === "people") {
                    navigate(`/search`, {
                        state: {
                            defaultSearchTerm: keyword,
                            defaultChon: null,
                            defaultTab: 1
                        }
                    });
                } else if (searchType === "people-second") {
                    navigate(`/search`, {
                        state: {
                            defaultSearchTerm: null,
                            defaultChon: 2,
                            defaultTab: 1
                        }
                    });
                } else { /** exp */
                    navigate(`/search`, {
                        state: {
                            defaultSearchTerm: keyword,
                            defaultChon: null,
                            defaultTab: 3
                        }
                    });
                }
            }}
        >
            {renderItem()}
        </div>
    );
};

export default SuggestionItem;
