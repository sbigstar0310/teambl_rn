/**
 * Text Button displayed in link color
 * @param {TextButtonProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function TextButton(props) {
    const className =
        "btn text-sm text-primary font-semibold cursor-pointer hover:opacity-60 transition-all disabled:text-secondary disabled:font-normal" +
        (props.className ? ` ${props.className}` : "");
    return (
        <button
            className={className}
            disabled={props.disabled}
            type="button"
            onClick={props.onClick}
        >
            {props.text}
        </button>
    );
}

/**
 * @typedef {Object} TextButtonProps
 * @prop {string} text - text to be displayed on the button
 * @prop {Function} onClick - handler for button click event
 * @prop {boolean} [disabled] - whether the button is disabled or not
 * @prop {string} [className] - additional classnames to apply for button
 */