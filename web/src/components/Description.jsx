import React, { useState } from "react";
import "../styles/NewProject/NewProject.css";

const Description = ({ description, contacts }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <div
                className="project-description-section"
                style={{
                maxHeight: isExpanded ? "none" : `100px`,
                overflow: "hidden",
                position: "relative",
                }}
            >
            <p>{description}</p>
            {!isExpanded && (
                <div className="project-gradient-overlay" >
                    <button className="project-expand-button" onClick={toggleExpand}>
                    전체 보기
                    </button>
                </div>
            )}
        </div>
        {isExpanded && (
            <div className="project-contact-info-section">
                <strong>연락처</strong>
                {contacts && contacts.length > 0 ? (
                    contacts.map((contact, index) => (
                        <div key={index}>{contact.contact_info}</div>
                    ))
                ) : (
                    <p>연락처 정보가 없습니다.</p>
                )}
            </div>
        )}
        </div>
    );
};

export default Description;
