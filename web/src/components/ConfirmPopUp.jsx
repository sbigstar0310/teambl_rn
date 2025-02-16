import React from 'react';
import "../styles/ConfirmPopUp.css"

/**
 * Re-usable confirmation modal(popup).
 * 
 * @param {boolean} isOpen
 * @param {function} setIsOpen
 * @param {string} message
 * @param {function} onConfirm callback function when the user confrims.
 * @param {function} onReject callback function when the user rejects.
 * @param {string} confirmLabel confirm button text
 * @param {string} rejectLabel reject button text
 * @param {boolean} isCrucial if this value is not null and true, the accept button will have grey color.
 */
const ConfirmPopUp = ({ isOpen, setIsOpen, message, onConfirm, onReject, confirmLabel, rejectLabel, isCrucial }) => {

    if (isOpen) {
        return (
            <div
                className='confirmPopUp-overlay'
                onClick={() => setIsOpen(false)}
            >
                <div
                    className='confirmPopUp-content-container'
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >   
                    {/** confirmation message */}
                    <div className='confirmPopUp-message-container'>
                        <span className='confirmPopUp-message'>
                            {message}
                        </span>
                    </div>
                    {/** buttons */}
                    <div className='confirmPopUp-button-container'>
                        <button
                            className='confirmPopUp-button button-reject'
                            onClick={
                                (isCrucial == null) ?
                                    onReject
                                    :
                                    ( isCrucial ? onConfirm : onReject )
                            }
                        >
                            {
                                (isCrucial == null) ?
                                rejectLabel
                                :
                                ( isCrucial ? confirmLabel : rejectLabel )
                            }
                        </button>
                        <button
                            className='confirmPopUp-button button-confirm'
                            onClick={
                                (isCrucial == null) ?
                                    onConfirm
                                    :
                                    ( isCrucial ? onReject : onConfirm )
                            }
                        >
                            {
                                (isCrucial == null) ?
                                confirmLabel
                                :
                                ( isCrucial ? rejectLabel : confirmLabel )
                            }
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        return (<></>);
    }
};

export default ConfirmPopUp;