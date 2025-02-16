import {useRef, useState} from "react";
import {trimContent} from "./conversations-utils.js";
import crossIcon from '../../assets/Conversations/crossIcon.svg';
import plusIcon from '../../assets/Conversations/plusIcon.svg';
import sendIcon from '../../assets/Conversations/sendIcon.svg';

/**
 * Message input
 * @param {MessageInputProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function MessageInput(props) {
    const inputRef = useRef(null);
    const [text, setText] = useState("");
    const [attachedImage, setAttachedImage] = useState(null);

    const handleText = (e) => {
        const text = e.target.value;
        setText(e.target.value);
        const rowsLength = text.split("\n").length;
        e.target.rows = rowsLength > 4 ? 4 : rowsLength;
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert("You can only send up to 5 images at once.");
        }
        setAttachedImage(file);
        e.target.value = null;
    };

    const handleFilePreview = () => {
        if (!attachedImage) return;
        const url = URL.createObjectURL(attachedImage);
        window.open(url, "_blank");
    }

    const handleFileDelete = () => {
        setAttachedImage(null);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!(text || attachedImage)) return;
        const incomingMessage = {};
        if (text) incomingMessage.message = text;
        if (attachedImage) incomingMessage.image = attachedImage;
        props.onSubmit(incomingMessage);
        setText("");
        setAttachedImage(null);
        inputRef.current.rows = 1;
    };

    return (
        <form className="p-2" onSubmit={handleSend}>
            {/* Attachments preview (optionally displayed) */}
            <div className="w-full flex">
                {/* Attachments */}
                {attachedImage && (
                    <div className="relative rounded-md text-contrast">
                        {/* Preview */}
                        <div
                            className="flex flex-col items-center gap-2 p-2 cursor-pointer opacity-60 hover:opacity-100"
                            onClick={handleFilePreview}
                        >
                            <div className="w-16 h-16 flex justify-center items-center">
                                <img
                                    src={URL.createObjectURL(attachedImage)}
                                    alt="Preview"
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                            </div>
                            <span className="text-xs">{trimContent(attachedImage.name, 10)}</span>
                        </div>
                        <button
                            type="button"
                            title="Remove file"
                            onClick={handleFileDelete}
                            className="btn cursor-pointer absolute -right-1 top-0 text-secondary hover:text-contrast"
                        >
                            <img className="w-3 h-3" src={crossIcon} alt="Remove"/>
                        </button>
                    </div>
                )}
            </div>
            {/* Input (always displayed) */}
            <div className="w-full flex items-end gap-2 p-2">
                <div
                    className="bg-secondary-bg rounded-full cursor-pointer hover:opacity-60"
                    title="Add Image"
                >
                    <label className="cursor-pointer" htmlFor="upload-file">
                        <img className="p-2" src={plusIcon} alt="Add"/>
                    </label>
                    <input
                        type="file"
                        id="upload-file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFile}
                    />
                </div>
                <textarea
                    className="flex-grow outline-none border-none rounded-md bg-secondary-bg p-2 text-sm resize-none"
                    value={text}
                    rows={1}
                    name="text"
                    // en: Send message
                    placeholder="메세지 보내기"
                    onChange={handleText}
                    ref={inputRef}
                />
                <button
                    className="btn flex items-center justify-center p-2 pr-2.5 pt-2.5 rounded-full bg-primary cursor-pointer hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={!(text || attachedImage)}
                >
                    <img src={sendIcon} alt="Send"/>
                </button>
            </div>
        </form>
    );
}

/**
 * @typedef {Object} MessageInputProps
 * @prop {Function} onSubmit
 */