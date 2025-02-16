import {useState} from "react";
import conversationsApi from "./conversations-api";
import TextButton from "./TextButton";
import backIcon from '../../assets/backIcon.svg';
import defaultProfileImage from "../../assets/default_profile_image.svg";
import Avatar from "./Avatar.jsx";
import searchIcon from "../../assets/gosearchIcon.svg";

/**
 * Search UI to search for users in the system
 * @param {SearchUsersProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function SearchUsers(props) {
    const [results, setResults] = useState([]);
    const [chosenUserId, setChosenUserId] = useState(null);

    const handleSearch = (query) => {
        if (!query || query.length < 2) return setResults([]);
        conversationsApi.searchUsers(query).then(setResults);
        setChosenUserId(null);
    };

    const handleChoose = (user) => {
        if (chosenUserId === user.id) {
            setChosenUserId(null);
        } else {
            setChosenUserId(user.id);
        }
    };

    const handleConfirm = () => {
        if (!chosenUserId) return;
        props.onConfirm(chosenUserId);
    };

    return (
        <>
            {/* Header */}
            <div className="w-full flex p-2 pt-4 gap-4 items-center text-contrast">
                {/* Back button */}
                <div
                    onClick={props.onBack}
                    className="cursor-pointer hover:opacity-60 transition-all"
                >
                    <img src={backIcon} alt="Back"/>
                </div>
                {/* Title */}
                <span className="text-md font-semibold flex-grow">
                    {/* en: New message */}
                    새 매시지
                </span>
                {/* Confirm button */}
                <TextButton
                    // en: OK
                    text="확인"
                    onClick={handleConfirm}
                    disabled={!chosenUserId}
                />
            </div>
            <div className="px-2 py-1 flex flex-col overflow-y-auto">
                {/* Search input */}
                <SearchInput onSearch={handleSearch}/>
                {/* Search results */}
                <div className="flex-grow flex flex-col gap-1 my-3">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            onClick={handleChoose.bind(null, result.user)}
                            className={
                                "rounded-sm border-b-[#d9d9d9] cursor-pointer hover:opacity-75 " +
                                (result.user.id === chosenUserId ? "bg-secondary-bg" : "bg-default")
                            }
                            style={{
                                borderBottomWidth: 1,
                            }}
                        >
                            <SearchResult user={result.user} connectionLevel={result.connectionLevel}/>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

/**
 * @param {SearchResultProps} props
 * @returns {JSX.Element}
 * @constructor
 */
function SearchResult(props) {
    const {
        user,
        // connectionLevel
    } = props;
    const userName = user.profile.user_name;
    const imageUrl = user.profile.image ?? defaultProfileImage;
    const school = user.profile.school;
    const academicDegree = user.profile.current_academic_degree;
    const admissionYear = user.profile.year;
    const department = user.profile.major1;
    const keywords = user.profile.keywords;
    return (
        <div className="w-full flex gap-2 py-3 px-1">
            {/* Avatar */}
            <div className="py-2">
                <Avatar image_url={imageUrl} user_name={userName}/>
            </div>
            <div className="flex-grow flex flex-col">
                {/* Name ㆍ Connection level */}
                <div className="flex items-center">
                    <span className="text-lg font-semibold">{userName}</span>
                    {/* ㆍconnectionLevel */}
                    {/*{connectionLevel > 0 &&*/}
                    {/*    <span className="text-sm text-secondary">ㆍ{connectionLevel}촌</span>}*/}
                </div>
                <div className="text-md flex flex-col">
                    {/* University | Program | Admission year */}
                    <span>
            {school} | {academicDegree} | {admissionYear}
          </span>
                    {/* Department */}
                    <span>{department}</span>
                </div>
                {/* Interests */}
                <span className="text-md text-secondary">
          {keywords.join(" / ")}
        </span>
            </div>
        </div>
    );
}

/**
 * Input for user to enter filtering info of users
 * @param {SearchInputProps} props
 * @returns {JSX.Element}
 * @constructor
 */
function SearchInput(props) {
    return (
        <div className="w-full flex items-center rounded-lg bg-secondary-bg">
            <div className="flex justify-center items-center px-3 p-2">
                <img src={searchIcon} alt="Search" className="max-w-4"/>
            </div>
            <input
                className="no-border flex-grow h-12 mr-2 rounded-md bg-transparent outline-none"
                type="text"
                placeholder="사람 검색" // en: Search people
                onChange={(e) => props.onSearch(e.target.value)}
            />
        </div>
    );
}

/**
 * @typedef {Object} SearchUsersProps
 * @prop {Function} onBack - when user goes back from search UI
 * @prop {Function} onConfirm - when user selects and confirms the user by search
 */

/**
 * @typedef {Object} SearchResultProps
 * @prop {Object} user
 * @prop {number} connectionLevel
 */

/**
 * @typedef {Object} SearchInputProps
 * @prop {Function} onSearch - when user performs search
 */