import TextButton from "./TextButton";

/**
 * Exit Confirmation Modal
 * @param {ExitConfirmationProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function ExitConfirmation(props) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="w-5/6 sm:w-1/2 bg-default p-8 sm:p-12 rounded-md">
                <p className="text-lg text-center">
                    {/* en: Do you want to exit? */}
                    대화창을 나가겠습니까?
                </p>
                <p className="text-sm text-center text-secondary mt-4">
                    {/* en: If you leave the chat history will be deleted. */}
                    대화창에서 나가면 이전 대화 내용들은 삭제 됩니다.
                </p>
                <div className="flex justify-around gap-8 mt-8">
                    <TextButton
                        text="취소" // en: Cancel
                        onClick={props.onCancel}
                        className="text-secondary"
                    />
                    <TextButton
                        text="나가기" // en: Exit
                        onClick={props.onConfirm}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * @typedef {Object} ExitConfirmationProps
 * @prop {Function} onCancel
 * @prop {Function} onConfirm
 */