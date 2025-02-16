import React from 'react';
import "../styles/UserInfoToggleItem.css";
import ProfileDefaultImg from "../assets/default_profile_image.svg";

const UserInfoToggleItem = ({ userInfo, isToggleOn, toggleItem }) => {
    return (
        <div
            className='userInfoToggle-container'
            onClick={() => toggleItem()}
            style={
                isToggleOn ?
                    {
                        backgroundColor: '#F5F5F5'
                    }
                    :
                    {}
            }
        >
            {/** profile image */}
            <div
                className='userInfoTogge-profile-img-container'
            >
                <img
                    src={userInfo.image ? userInfo.image : ProfileDefaultImg}
                />
            </div>
            {/** infos */}
            <div
                className='userInfoTogge-profile-info-container'
            >
                {/** Name and Chon */}
                <div
                    className='userInfoToggle-info-line-container'
                >
                    <span
                        className='userInfoToggle-name'
                    >
                        {userInfo['user_name']}
                    </span>
                    {
                        (userInfo['one_degree_distance'] == null) || (userInfo['one_degree_distance'] >= 4) &&
                        <span
                            className='userInfoToggle-chon'
                        >
                            {`ㆍ4촌 이상`}
                        </span>
                    }
                    {
                        (userInfo['one_degree_distance'] != null) && (userInfo['one_degree_distance'] < 4) &&
                        <span
                            className='userInfoToggle-chon'
                        >
                            {`ㆍ${userInfo['one_degree_distance']}촌`}
                        </span>
                    }
                </div>
                {/** School */}
                <div
                    className='userInfoToggle-info-line-container'
                    style={{
                        marginTop: '9px'
                    }}
                >
                    <span
                        className='userInfoToggle-school'
                    >
                        {userInfo['school']}
                    </span>
                    <span className='userInfoToggle-vertical'>{"|"}</span>
                    <span
                        className='userInfoToggle-school'
                    >
                        {userInfo['current_academic_degree']}
                    </span>
                    <span className='userInfoToggle-vertical'>{"|"}</span>
                    <span
                        className='userInfoToggle-school'
                    >
                        {`${userInfo['year'] % 100}학번`}
                    </span>
                </div>
                {/** Depts */}
                <div
                    className='userInfoToggle-info-line-container'
                    style={{
                        marginTop: '2px'
                    }}
                >
                    {/** major 1 */}
                    <span
                        className='userInfoToggle-school'
                    >
                        {userInfo['major1']}
                    </span>
                    {/** major 2 */}
                    {
                        userInfo['major2'] && ((userInfo['major2'] !== "")) &&
                        <span
                            className='userInfoToggle-school'
                        >
                            {`ㆍ${userInfo['major2']}`}
                        </span>
                    }
                </div>
                {/** Keywords */}
                {
                    userInfo['keywords'] && (userInfo['keywords'].length > 0) &&
                    <div
                        className='userInfoToggle-info-line-container'
                        style={{
                            marginTop: '8px'
                        }}
                    >
                        {
                            userInfo['keywords'].join('/').split('').map((keyword, index) => {
                                if (keyword === '/') {
                                    return (
                                        <span
                                            className='userInfoToggle-slash'
                                            key={index}
                                        >
                                            {keyword}
                                        </span>
                                    );
                                } else {
                                    return (
                                        <span
                                            className='userInfoToggle-keyword'
                                            key={index}
                                        >
                                            {keyword}
                                        </span>
                                    );
                                }
                            })
                        }
                    </div>
                }
            </div>
        </div>
    );
};

export default UserInfoToggleItem;