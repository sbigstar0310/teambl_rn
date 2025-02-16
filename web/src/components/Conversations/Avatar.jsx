/**
 * Image display for the user avatar
 * @param {AvatarProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function Avatar(props) {
    return (
        <img
            src={props.image_url}
            alt={props.user_name}
            width={52}
            height={52}
            className="w-12 h-12 rounded-full object-cover"
        />
    );
}

/**
 * @typedef {Object} AvatarProps
 * @prop {string} user_name - name of the user to be displayed as alt prop
 * @prop {string} image_url - URL of the user avatar
 */