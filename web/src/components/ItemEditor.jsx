import React, { useEffect, useState } from 'react';
import "../styles/ItemEditor.css";
import { toastText } from './Toast/Toast';

/**
 * Re-usable item editor component
 * 
 * @param {String} type Must be "string" or "tag".
 * @param {Array} currentItem
 * @param {Function} setCurrentItemList async function
 */
const ItemEditor = ({ type, currentItemList, setCurrentItemList, placeholderMsg, maxItemNum, preventValueDuplication, duplicatedValueMsg }) => {

    const [newValue, setNewValue] = useState("");
    const [isValid, setIsValid] = useState(false);

    /** intialize */
    const initialize = () => {
        setNewValue("");
        setIsValid(false);
    };

    /** utils */
    const pushItem = async (value) => {
        if ((preventValueDuplication != null) && preventValueDuplication) {
            if (currentItemList.includes(value)) {
                toastText(duplicatedValueMsg ? duplicatedValueMsg : "이미 존재하는 값입니다.");
            } else {
                let newList = [...currentItemList];
                newList.push(value);
                await setCurrentItemList(newList);
            }
        } else {
            let newList = [...currentItemList];
            newList.push(value);
            await setCurrentItemList(newList);
        }
    };

    const popItem = async (index) => {
        let newList = [...currentItemList];
        newList.splice(index, 1);
        await setCurrentItemList(newList);
    };

    const handleKeyInput = async (e) => {
        if(e.key === "Enter") {
            if (isValid && (currentItemList.length < maxItemNum)) {
                await pushItem(newValue);
            } else {
                if (!isValid) {
                    if (newValue !== "") {
                        toastText("올바르지 않은 값입니다.");
                    }
                } else {
                    toastText(`최대 ${maxItemNum}개만 입력 가능합니다.`);
                }
            }
        }
    }

    /** effects */
    useEffect(() => {
        initialize();
    }, [currentItemList]);

    useEffect(() => {
        setIsValid((newValue != null) && (newValue != "") && (!newValue.startsWith(" ")));
    }, [newValue]);

    return (
        <div className='itemEditor-container'> 
            {/** tags */}
            {
                (type === "tag") &&
                <>
                    {
                        (currentItemList.length > 0) &&
                        <div className='itemEditor-item-tag-container'>
                        {
                            currentItemList.map((tempTag, index) => {
                                return (
                                    <div
                                        key={tempTag + index}
                                        className={
                                            'itemEditor-item-tag itemEditor-item-with-mr-8'
                                        }
                                    >
                                        <span className='itemEditor-item-tag-content'>
                                            {tempTag}
                                        </span>
                                        <button
                                            className='itemEditor-item-tag-delete-button'
                                            onClick={async () => await popItem(index)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
                                                <path d="M1 8.5L8 1.5M8 8.5L1 1.5" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })
                        }
                        </div>
                    }
                </>
            }
            {/** strings */}
            {
                (type === "string") &&
                <>
                    {
                        (currentItemList.length > 0) &&
                        <div className='itemEditor-item-row-container'>
                        {
                            currentItemList.map((tempValue, index) => {
                                return (
                                    <div className='itemEditor-anon-container' key={tempValue + index}>
                                    <div
                                        className='itemEditor-item-row'
                                        style={
                                            (index === 0) ?
                                            {
                                                paddingTop: '0px'
                                            }
                                            :
                                            {}
                                        }
                                    >
                                        <span className='itemEditor-row-text'>
                                            {tempValue}
                                        </span>
                                        <button
                                            className='itemEditor-item-row-delete-button'
                                            onClick={async () => await popItem(index)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M1 11L11 1M11 11L1 1" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                    {
                                        (index !== (currentItemList.length - 1)) &&
                                        <div className='itemEditor-horizontal-line'>
                                            {/** no content */}
                                        </div>
                                    }
                                    </div>
                                );
                            })
                        }
                        </div>
                    }
                </>
            }
            {/** horizontal line */}
            {
                (currentItemList.length > 0) &&
                <div className='itemEditor-horizontal-line'>
                    {/** no content */}
                </div>
            }
            {/** input area */}
            <div className='itemEditor-input-container'>
                <input
                    className='itemEditor-input'
                    placeholder={placeholderMsg}
                    value={newValue}
                    onChange={(e) => {setNewValue(e.target.value)}}
                    readOnly={(currentItemList.length >= maxItemNum)}
                    onKeyDown={async (e) => await handleKeyInput(e)}
                />
            </div>
            {/** horizontal line */}
            <div className='itemEditor-horizontal-line'>
                {/** no content */}
            </div>
            {/** add button */}
            <div
                className='itemEditor-add-button-container'
                onClick={async () => {
                    if (isValid && (currentItemList.length < maxItemNum)) {
                        await pushItem(newValue);
                    } else {
                        if (!isValid) {
                            if (newValue !== "") {
                                toastText("올바르지 않은 값입니다.");
                            }
                        } else {
                            toastText(`최대 ${maxItemNum}개만 입력 가능합니다.`);
                        }
                    }
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                    <path d="M6.5 1V11" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M11.5 6L1.5 6" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className='itemEditor-add-button-text itemEditor-item-with-ml-8'>
                    {"추가하기"}
                </span>
            </div>
        </div>
    );
};

export default ItemEditor;