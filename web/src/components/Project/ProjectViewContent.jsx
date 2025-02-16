import React, { useEffect, useRef, useState } from 'react';
import "../../styles/Project/ProjectViewContent.css";
import SuspenseBox from '../SuspenseBox';

const MAX_HEIGHT = 110;

const ProjectViewContent = ({ isLoading, data }) => {

    const textRef = useRef(null);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
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
                            return craftLineWithLink(line, index);
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