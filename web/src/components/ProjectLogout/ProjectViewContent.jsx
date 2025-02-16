import React, { useEffect, useRef, useState } from 'react';
import "../../styles/Project/ProjectViewContent.css";
import SuspenseBox from '../SuspenseBox';

const MAX_HEIGHT = 110;

const dummyCot = ["rrreer@nave.ccd", "010-2322-3333"];

const ProjectViewContent = ({ isLoading, data }) => {

    const textRef = useRef(null);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        if (textRef.current) {
            if (textRef.current.scrollHeight > MAX_HEIGHT) {
                setIsOverflowing(true);
            } else {
                setIsOverflowing(false);
            }
        }
    }, [textRef, data]);

    return (
        <div className='projectView-content-container'>
            {/** title */}
            <div className='projectView-content-title-container'>
                {
                    isLoading &&
                    <SuspenseBox
                        styleOv={{
                            width: '105px',
                            height: '19px'
                        }}
                    />
                }
                {
                    (!isLoading) &&
                    <span className='projectView-content-title'>
                        {data?.title}
                    </span>
                }
            </div>
            {/** tags */}
            <div
                className='projectView-content-keyword-container'
                style={
                    ((isLoading) || (data?.keywords?.length > 0)) ?
                        {
                            marginTop: '16px'
                        }
                        :
                        {
                            marginTop: '0px'
                        }
                }
            >
                {
                    (isLoading) &&
                    <>
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px'
                            }}
                        />
                        <SuspenseBox
                            styleOv={{
                                width: '54px',
                                height: '17px'
                            }}
                        />
                    </>
                }
                {
                    (!isLoading) && data?.keywords?.map(keyword => {
                        return (
                            <div
                                key={keyword}
                                className='projectView-content-keyword'
                            >
                                {keyword}
                            </div>
                        );
                    })
                }
            </div>
            {/** content */}
            {
                isLoading &&
                <SuspenseBox
                    styleOv={{
                        width: '100%',
                        height: `${MAX_HEIGHT}px`,
                        marginTop: '16px'
                    }}
                />
            }
            {
                (!isLoading) &&
                <div
                    className='projectView-content-text-container'
                    ref={textRef}
                    style={{
                        maxHeight: isOverflowing ? (isExpanded ? "" : `${MAX_HEIGHT}px`) : ""
                    }}
                >
                    {
                        data.content && data.content.split('\n').map((line, index) => {
                            return (
                                <span
                                    key={index}
                                    className={`projectView-content-text`
                                        + `${((index + 1) === data.content.split('\n').length) ? " content-last-line" : ""}`}
                                >
                                    {
                                        (line.length === 0) ? '⠀' : line
                                    }
                                </span>
                            );
                        })
                    }
                    {/** contact : string */}
                    {
                        data['contacts'] && (typeof data['contacts'] === "string") &&
                        <div className='projectView-content-contact-container'>
                            <span className='projectView-content-contact-title'>
                                {"연락처"}
                            </span>
                            <span className='projectView-content-contact-text'>
                                {data['contacts']}
                            </span>
                        </div>
                    }
                    {/** contact : array */}
                    {
                        data['contacts'] && (typeof data['contacts'] === "object") &&
                        data['contacts'].map((contact, index) => {
                            return (
                                <div
                                    key={index}
                                    className='projectView-content-contact-container'
                                    style={
                                        (index === 0) ?
                                        {}
                                        :
                                        {
                                            marginTop: '5px'
                                        }
                                    }
                                >
                                    <span className='projectView-content-contact-title'>
                                        {"연락처 " + (index + 1)}
                                    </span>
                                    <span className='projectView-content-contact-text'>
                                        {contact.contact_info}
                                    </span>
                                </div>
                            );
                        })
                    }
                    {
                        isOverflowing &&
                            <button
                                className='projectView-content-expand-button'
                                onClick={toggleExpand}
                            >
                                {
                                    isExpanded ?
                                    "접기"
                                    :
                                    "전체 보기"
                                }
                            </button>
                    }
                </div>
            }
        </div>
    );
};

export default ProjectViewContent;