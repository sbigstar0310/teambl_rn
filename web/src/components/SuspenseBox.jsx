import React from 'react';
import "../styles/SuspenseBox.css";

const SuspenseBox = ({ styleOv }) => {

    const overrideStyleOv = (style) => {
        let defaultStyle = {
            width: '100px',
            height: '50px',
            borderRadius: '5px'
        };
        if (typeof style === "object") {
            Object.keys(style).map(key => {
                defaultStyle[key] = style[key];
            });
        }
        return defaultStyle;
    };

    return (
        <div
            style={overrideStyleOv(styleOv)}
            className='suspenseBox-suspense'
        >
            {/** no content */}
        </div>
    );
};

export default SuspenseBox;