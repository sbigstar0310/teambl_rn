import React, {useEffect, useRef, useState} from 'react';
import "../../styles/Project/ProjectViewContent.css";
import SuspenseBox from '../SuspenseBox';

const MAX_HEIGHT = 110;

const ProjectResultViewContent = ({isLoading, data}) => {

    const textRef = useRef(null);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    /** NEW : find URL */
    const findUrl = (line) => {
        const urlPattern = /(https?:\/\/[^\s,!;()"'<>\[\]{}]+|www\.[^\s,!;()"'<>\[\]{}]+)/g;
        const parts = line.split(urlPattern);
        const matches = line.match(urlPattern) || [];

        if (parts.length === 1) {
            return [];
        }

        let result = [];
        let matchIndex = 0;

        parts.forEach(part => {
            if (matches.includes(part)) {
                result.push({
                    text: part,
                    type: 'link',
                    url: matches[matchIndex]
                });
                matchIndex++;
            } else {
                result.push({
                    text: part,
                    type: 'text'
                });
            }
        });

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
                        + `${((index + 1) === data.content.split('\n').length) ? " content-last-line" : ""}`}
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
                                        href={parsedTextInfo.url.startsWith('www') ? `https://${parsedTextInfo.url}` : parsedTextInfo.url}
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
                        + `${((index + 1) === data.content.split('\n').length) ? " content-last-line" : ""}`}
                >
                    {
                        (line.length === 0) ? '⠀' : line
                    }
                </span>
            );
        }
    }

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
        <div className="projectView-content-container p-0">
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
                    className='projectView-content-text-container m-0'
                    ref={textRef}
                    style={{
                        maxHeight: isOverflowing ? (isExpanded ? "" : `${MAX_HEIGHT}px`) : ""
                    }}
                >
                    {
                        data.content && data.content.split('\n').map((line, index) => {
                            return craftLineWithLink(line, index);
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
            {/** tags */}
            <div
                className='projectView-content-keyword-container mt-2'
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
        </div>
    );
};

export default ProjectResultViewContent;