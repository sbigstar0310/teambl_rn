import React, {useEffect, useState} from 'react';
import api from '../api';
import "../styles/PeopleTagPopUp.css";
import topBarIcon from "../assets/popUpTopBar.svg";
import majorEdit from "../assets/Profile/majorEdit.svg";
import UserInfoToggleItem from './UserInfoToggleItem';

const PeopleTagPopUp = ({
                            isPopUpOpen,
                            setIsPopUpOpen,
                            selectedPeopleList,
                            setSelectedPeopleList,
                            maxSelectNum,
                            myId,
                            filterFunc,
                            confirmCallback
                        }) => {

    const [isDataLoading, setIsDataLoading] = useState(false);
    const [peopleList, setPeopleList] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isChanged, setIsChanged] = useState(false);
    const [currentSelectedPeopleList, setCurrentSelectedPeopleList] = useState([]);

    /** search people list */
    const searchPeopleList = async (currentSelectedList) => {
        await setIsDataLoading(true);
        try {
            const response = await api.post(`/api/search/name/`, {
                user_name: searchKeyword
            });
            const result = response.data ?? [];
            const peopleList = result
                .filter(({id}) => id !== myId && !currentSelectedList.some(({id: selectedId}) => selectedId === id))
                .map(({is_new_user, relation_degree, user}) => ({
                    id: user.id,
                    one_degree_distance: relation_degree,
                    is_new_user,
                    ...user.profile
                }))
            await setPeopleList(peopleList);
        } catch (e) {
            console.log(e);
            await setPeopleList([]);
        } finally {
            await setIsDataLoading(false);
        }
    };

    /** utils */
    const toggleItem = async (value, index) => {
        if (typeof (currentSelectedPeopleList.find(item => (item.id === value.id))) === "undefined") {
            await pushItem(value, index);
        } else {
            await popItem(value, index);
        }
    };

    const pushItem = async (value, index) => {
        console.log("push");
        if (currentSelectedPeopleList.length < maxSelectNum) {
            console.log("push!");
            /** pop from the people list */
            await setPeopleList(prevState => {
                let newState = [...prevState];
                newState.splice(index, 1);
                return newState;
            });
            /** push to the current list */
            await setCurrentSelectedPeopleList(prevList => {
                let newList = [...prevList];
                newList.push(value);

                /** update peple list */
                searchPeopleList(newList);
                
                return newList;
            });
        }
    };

    const popItem = async (value, index) => {
        /** push to the people list */
        await setPeopleList(prevState => {
            let newState = [...prevState];
            newState.push(value);
            return newState;
        });
        await setCurrentSelectedPeopleList(prevList => {
            let newList = [...prevList];
            newList.splice(index, 1);

            /** update people list */
            searchPeopleList(newList);

            return newList;
        });
    };

    /** array diff checker */
    const isArraySame = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;

        let serializedArr1 = arr1.map(item => {
            return item.id
        });
        let serializedArr2 = arr2.map(item => {
            return item.id
        });

        const sortedArr1 = [...serializedArr1].sort();
        const sortedArr2 = [...serializedArr2].sort();
    
        return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
    };

    useEffect(() => {
        setPeopleList([]);
        setSearchKeyword("");
        setCurrentSelectedPeopleList(JSON.parse(JSON.stringify(selectedPeopleList)));
    }, [isPopUpOpen, selectedPeopleList]);

    useEffect(() => {
        setIsChanged(!isArraySame(selectedPeopleList, currentSelectedPeopleList));
    }, [selectedPeopleList, currentSelectedPeopleList]);

    useEffect(() => {
        if (searchKeyword != null) {
            searchPeopleList(currentSelectedPeopleList);
        }
    }, [searchKeyword]);

    return (
        <div
            className={'peopleSelectPopUp-overlay-wrapper'}
            onClick={() => setIsPopUpOpen(false)}
        >
            <div
                className='peopleSelectPopUp-overlay'
                onClick={(e) => e.stopPropagation()}
            >
                <div className="peopleSelectPopUp-top">
                    <img
                        style={{
                            margin: '16px 0px 16px 0px'
                        }}
                        src={topBarIcon}
                        alt="top useless bar"
                    />
                </div>
                <div className="peopleSelectPopUp-title-container">
                    <span className="peopleSelectPopUp-title-lg">
                        {"사람 태그"}
                    </span>
                </div>
                <div
                    className="peopleSelectPopUp-search-container"
                    style={{
                        marginTop: '12px'
                    }}
                >
                    <img
                        src={majorEdit}
                        alt="전공 아이콘"
                        className="peopleSelectPopUp-search-icon"
                    />
                    <input
                        type="text"
                        placeholder={"이름으로 검색"}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="peopleSelectPopUp-search-input"
                    />
                </div>
                <div
                    className="peopleSelectPopUp-body"
                    style={{
                        marginTop: '16px'
                    }}
                >
                    {
                        currentSelectedPeopleList &&
                        currentSelectedPeopleList.map((peopleInfo, index) => {
                            return (
                                <UserInfoToggleItem
                                    key={peopleInfo.id}
                                    userInfo={peopleInfo}
                                    isToggleOn={true}
                                    toggleItem={() => toggleItem(peopleInfo, index)}
                                />
                            );
                        })
                    }
                    {
                        peopleList &&
                        peopleList.map((peopleInfo, index) => {
                            return (
                                <UserInfoToggleItem
                                    key={peopleInfo.id}
                                    userInfo={peopleInfo}
                                    isToggleOn={false}
                                    toggleItem={() => toggleItem(peopleInfo, index)}
                                />
                            );
                        })
                    }
                </div>
                {/** save button */}
                <button
                    className={
                        "peopleSelectPopUp-footer-btn" +
                        (
                            isChanged ?
                                ""
                                :
                                " peopleSelectPopUp-btn-disabled"
                        )
                    }
                    onClick={async () => {
                        await setSelectedPeopleList([...currentSelectedPeopleList]);
                        await setIsPopUpOpen(false);
                        if (confirmCallback) {
                            await confirmCallback([...currentSelectedPeopleList]);
                        }
                    }}
                >
                    {"선택 완료"}
                </button>
            </div>
        </div>
    );
};

export default PeopleTagPopUp;