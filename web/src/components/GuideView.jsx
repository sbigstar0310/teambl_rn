import React from 'react';
import "../styles/GuideView.css";
import GuideIcon from "../assets/guideIcon.svg";

const GUIDE_LINK = {
    GUIDE : "https://grateful-steel-1e5.notion.site/13e1858400b7805db9fef67de9e60b95?pvs=4"
};

const GuideView = () => {
    return (
        <div className='guide-view-container'>
            <a
                href={GUIDE_LINK.GUIDE}
                target="_blank"
                rel="noopener noreferrer"
            >
                {"팀블 서비스 안내"}
            </a>
        </div>
    );
};

export default GuideView;