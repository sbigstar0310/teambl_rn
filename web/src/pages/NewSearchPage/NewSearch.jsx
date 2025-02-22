import React, { useState, useEffect, useRef } from "react";
import "../../styles/NewSearch.css";
import BackIcon from "../../assets/NewSearch/backIcon.svg";
import RecentIcon from "../../assets/NewSearch/recentIcon.svg";
import SearchIcon from "../../assets/NewSearch/searchIcon.svg";
import api from "../../api";
import NewUserSearchItem from "../../components/NewUserSearchItem";
import SearchLoading from "./SearchLoading";
import SearchProjectLoading from "./SearchProjectLoading";
import {useLocation, useNavigate} from "react-router-dom";
import ProjectResultView from "../../components/ProjectResult/ProjectResultView.jsx";

function NewSearch() {
  const navigate = useNavigate();
  const location = useLocation();

    const [users, setUsers] = useState([]); // 검색 결과로 필터링된 유저들
    const [searchTerm, setSearchTerm] = useState(""); // 검색어
    const [recentSearches, setRecentSearches] = useState([]); // 최근 검색 기록
    const [keywords, setKeywords] = useState([]); // DB에서 가져온 키워드들
    const [searchSuggestions, setSearchSuggestions] = useState([]); // 검색시 아래에 뜨는 추천 검색어
    const [filters, setFilters] = useState({
        relationshipDegree: [],
        majors: [],
    }); // 사용자가 선택한 검색 필터
    const [isSearched, setIsSearched] = useState(false); // 사용자가 검색 버튼을 눌렀는지 여부 (true이면 검색 결과창이 보임)
    const [isSearchLoading, setIsSearchLoading] = useState(false); // 검색 로딩중인지 여부
    const [isMoreUserLoading, setIsMoreUserLoading] = useState(false);
    const [nextPage, setNextPage] = useState(null); // 다음 유저 페이지의 api 요청 URL
    const observerRef = useRef(null); // Intersection Observer 참조용 ref
    const [projects, setProjects] = useState([]);
    // 사람, 게시물 필터
    const [selectedTab, setSelectedTab] = useState(1); // 기본값: '전체' 활성화

  /** NEW : default */
  useEffect(() => {
    if (location.state) {
      const timeout = setTimeout(() => {
        if (location.state.defaultSearchTerm) {
          setSearchTerm(location.state.defaultSearchTerm);
          setIsSearched(true);
        }
        if (location.state.defaultChon) {
          handleRelationshipDegreeChange(location.state.defaultChon);
        }
        if (location.state.defaultTab) {
          setSelectedTab(location.state.defaultTab);
        }
        navigate(location.pathname, {
          state: {
            ...location.state,
            defaultSearchTerm: null,
            defaultChon: null,
            defaultTab: null,
          },
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, []);

    useEffect(() => {
        // console.log("키워드 가져오기");
        fetchKeywords(); // 키워드 데이터를 불러오는 함수 호출
        fetchRecentSearches(); // 최근 검색 기록을 불러오는 함수 호출
        getProjects();
    }, []); // 빈 배열을 의존성으로 전달하여 컴포넌트 마운트 시 한 번만 실행

    useEffect(() => {
        // console.log("필터 변경으로 유저 검색하기");
        // apply filters to search both users or posts
        doSearchUsers(); // filters가 변경될 때 실행되는 함수
        getProjects();
    }, [filters, selectedTab]); // filters 배열을 의존성으로 전달하여 filters가 변경될 때마다 실행

    useEffect(() => {
        if (isSearched) {
            // console.log("검색어 변경으로 유저 검색하기");
            doSearchUsers();
        }
    }, [searchTerm]);

    // Intersection Observer 설정
    useEffect(() => {
        if (observerRef.current) {
            // 옵저버 인스턴스를 생성하고 마지막 요소를 관찰
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && nextPage && !isSearchLoading) {
                    loadMoreUsers(); // 마지막 요소가 화면에 나타나면 다음 페이지 로드
                }
            });

            // 옵저버가 마지막 요소를 관찰하도록 설정
            observer.observe(observerRef.current);

            // 컴포넌트가 언마운트되면 옵저버 해제
            return () => {
                if (observer && observer.disconnect) {
                    observer.disconnect();
                }
            };
        }
    }, [nextPage, isSearchLoading]);

    // DB에서 키워드 목록을 가져오는 함수
    const fetchKeywords = async () => {
        try {
            const response = await api.get("/api/keywords/"); // 키워드 리스트를 가져오는 API 엔드포인트
            console.log(response.data);
            const keywordStrings = response.data.map((item) => item.keyword);
            setKeywords(keywordStrings); // 키워드 데이터를 keywords 변수에 저장
            console.log(keywordStrings);
        } catch (error) {
            console.error("Failed to fetch keywords:", error);
        }
    };

    // DB에서 최근 검색 기록을 가져오는 함수
    const fetchRecentSearches = async () => {
        try {
            const response = await api.get("/api/search-history/"); // 최근 검색 기록을 가져오는 API 엔드포인트
            const recentSearchTerms = response.data.map((item) => item.keyword);
            setRecentSearches(recentSearchTerms); // 가져온 검색 기록을 recentSearches 변수에 저장
        } catch (error) {
            console.error("Failed to fetch recent searches:", error);
        }
    };

    // 검색을 실행하는 함수
    const doSearchUsers = async () => {
        setUsers([]);
        setIsSearched(true);
        setIsSearchLoading(true);

        // 최근 검색 기록에 검색어 추가 (중복 방지)
        if (searchTerm && !recentSearches.includes(searchTerm)) {
            await addSearchTerm(searchTerm);
        }

        try {
            const isSearchByExperience = selectedTab === 3;
            const apiSearchUrl = isSearchByExperience ? "/api/search/experiences/" : "/api/search/";
            const response = await api.post(apiSearchUrl, {
                q: searchTerm,
                degree: filters.relationshipDegree,
                majors: filters.majors.flat(),
            });
            setUsers(response.data.results);
            setNextPage(response.data.next);
            setIsSearchLoading(false);
        } catch (error) {
            console.error("검색 중 오류가 발생했습니다.", error);
        }
    };
    // 프로젝트 정보 가져오기
    const getProjects = () => {
        api
            .post("/api/search/projects/", {
                q: searchTerm,
                degree: filters.relationshipDegree,
            })
            .then((res) => res.data)
            .then((data) => {
                setProjects(data.results);
            })
            .catch((err) => alert(err));
    };

    // 추가 유저 페이지 데이터를 불러오는 함수
    const loadMoreUsers = async () => {
        if (!nextPage || isSearchLoading) return; // 더 이상 불러올 페이지가 없거나 이미 로딩 중이면 중단
        setIsMoreUserLoading(true);

        let safeNextPage = nextPage;
        // 프로덕션 환경에서만 http:// -> https:// 로 변경
        if (process.env.NODE_ENV === "production") {
            safeNextPage = nextPage.startsWith("http://")
                ? nextPage.replace("http://", "https://")
                : nextPage;
        }

        try {
            const response = await api.post(safeNextPage, {
                q: searchTerm,
                degree: filters.relationshipDegree,
                majors: filters.majors.flat(),
            });

            setUsers((prevUsers) => [...prevUsers, ...response.data.results]); // 기존 사용자에 추가
            setNextPage(response.data.next); // 다음 페이지 URL 업데이트
            setIsMoreUserLoading(false);
        } catch (error) {
            console.error("추가 데이터를 불러오는 중 오류가 발생했습니다.", error);
            setIsMoreUserLoading(false);
        }
    };

    // 새로운 검색 기록을 서버에 추가하는 함수
    const addSearchTerm = async (term) => {
        try {
            await api.post("/api/search-history/", {keyword: term}); // 검색 기록을 추가하는 API 호출
            setRecentSearches([term, ...recentSearches.slice(0, 4)]); // 최근 검색어 리스트를 업데이트
        } catch (error) {
            console.error("Failed to add search term:", error);
        }
    };

    // 검색어 변경 시 호출되는 함수
    const updateSearchSuggestions = (term) => {
        setSearchTerm(term);
        setIsSearched(false);
        if (term) {
            // 공백 제외 + 소문자로 변환하여 검색
            setSearchSuggestions(
                keywords.filter((item) =>
                    item
                        .replace(/\s+/g, "")
                        .toLowerCase()
                        .includes(term.replace(/\s+/g, "").toLowerCase())
                )
            );
        } else {
            setSearchSuggestions([]);
        }
    };

    // 최근 검색어를 지우는 함수
    const handleClear = async () => {
        try {
            // 먼저 서버에서 모든 검색 기록을 가져옵니다.
            const response = await api.get("/api/search-history/");
            const searchHistoryItems = response.data;

            // 검색 기록의 ID를 이용해 각각의 기록을 삭제합니다.
            await Promise.all(
                searchHistoryItems.map((item) =>
                    api.delete(`/api/search-history/${item.id}/`)
                )
            );

            // 모든 검색 기록을 삭제한 후, 상태를 업데이트합니다.
            setRecentSearches([]);
        } catch (error) {
            console.error("Failed to clear search history:", error);
        }
    };

    // 최근 검색어에서 특정 검색어를 삭제하는 함수
    const handleDelete = async (termToDelete) => {
        try {
            const response = await api.get("/api/search-history/");
            const searchItem = response.data.find(
                (item) => item.keyword === termToDelete
            );
            if (searchItem) {
                await api.delete(`/api/search-history/${searchItem.id}/`); // 특정 검색 기록 삭제
                setRecentSearches(
                    recentSearches.filter((term) => term !== termToDelete)
                ); // 로컬 상태 업데이트
            }
        } catch (error) {
            console.error("Failed to delete search term:", error);
        }
    };

    // 검색어를 선택했을 때 호출되는 함수
    const handleSelect = (term) => {
        setIsSearched(true);
        setSearchTerm(term);
    };

    // // 최근 검색어에서 특정 검색어를 삭제하는 함수
    // const handleDelete = (termToDelete) => {
    //   setRecentSearches(recentSearches.filter((term) => term !== termToDelete));
    // };

    // Enter 키를 눌렀을 때 검색을 실행하는 함수
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            doSearchUsers();
        }
    };

    // n촌 필터를 추가 및 제거하는 함수
    const handleRelationshipDegreeChange = (degree) => {
        setFilters((prev) => {
            const newRelationshipDegree = prev.relationshipDegree.includes(degree)
                ? prev.relationshipDegree.filter((item) => item !== degree)
                : [...prev.relationshipDegree, degree];
            return {...prev, relationshipDegree: newRelationshipDegree};
        });
    };

    // 전공 필터를 추가 및 제거하는 함수
    const handleMajorChange = (newMajors) => {
        setFilters((prev) => {
            // majors 배열을 평탄화하여 중첩 배열을 방지
            const flatMajors = prev.majors.flat(Infinity);

            // 새로 선택한 전공이 배열인지 아닌지 확인하고 평탄화
            let normalizedNewMajors = Array.isArray(newMajors)
                ? newMajors.flat()
                : [newMajors];

            // 새로 선택한 전공 목록을 기준으로 필터링
            const updatedMajors = [...new Set(normalizedNewMajors)];

            // 업데이트된 필터를 반환
            return {...prev, majors: updatedMajors};
        });
    };

    return (
        <div className="newSearch-container">
            <div className="newSearch-top-bar">
                <button
                    className="newSearch-back-button"
                    onClick={() => isSearched ? navigate("/home") : setIsSearched(true)}
                >
                    <img
                        src={BackIcon}
                        alt="뒤로가기 아이콘"
                        className="newSearch-back-icon"
                    />
                </button>
                <input
                    type="text"
                    placeholder="찾으시는 사람 또는 게시물이 있나요?"
                    value={searchTerm}
                    onChange={(e) => updateSearchSuggestions(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onClick={() => {
                        setIsSearched(false);
                    }}
                    className="newSearch-search-input"
                />
            </div>
            {searchTerm && !isSearched ? (
                <div className="newSearch-search-results">
                    <ul>
                        {searchSuggestions.map((result, index) => (
                            <li key={index} onClick={() => handleSelect(result)}>
                                <div className="newSearch-list-item-left">
                  <span role="img" aria-label="magnifying-glass">
                    <img
                        src={SearchIcon}
                        alt="검색"
                        className="newSearch-search-icon"
                    />
                  </span>
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: result.replace(
                                                new RegExp(searchTerm, "gi"),
                                                (match) =>
                                                    `<span class="newSearch-highlight">${match}</span>`
                                            ),
                                        }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : !isSearched ? (
                <>
                    <div className="newSearch-second-bar">
                        <h3>최근 검색어</h3>
                        <button className="newSearch-clear-button" onClick={handleClear}>
                            지우기
                        </button>
                    </div>
                    <div className="newSearch-search-results">
                        <ul>
                            {recentSearches.map((term, index) => (
                                <li key={index} onClick={() => handleSelect(term)}>
                                    <div className="newSearch-list-item-left">
                    <span role="img" aria-label="clock">
                      <img
                          src={RecentIcon}
                          alt="최근검색 아이콘"
                          className="newSearch-recent-icon"
                      />
                    </span>
                                        {term}
                                    </div>
                                    <button
                                        className="newSearch-delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(term);
                                        }}
                                    >
                                        삭제
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : (
                <>
                    <div
                        className="newSearch-filter-bar"
                        style={{
                            padding: '12.3px 20px'
                        }}
                    >
                        <button
                            className={`newSearch-filter-button ${
                                selectedTab === 1 ? "active" : ""
                            }`}
                            onClick={() => setSelectedTab(1)}
                        >
                            사람
                        </button>
                        <button
                            className={`newSearch-filter-button ${
                                selectedTab === 2 ? "active" : ""
                            }`}
                            onClick={() => setSelectedTab(2)}
                        >
                            게시물
                        </button>
                        <button
                            className={`newSearch-filter-button ${
                                selectedTab === 3 ? "active" : ""
                            }`}
                            onClick={() => setSelectedTab(3)}
                        >
                            경험
                        </button>
                    </div>

                    {/* "사람" 섹션: 사람 탭이 활성화된 경우에 표시 */}
                    {(selectedTab === 1 || selectedTab === 3) && (
                        <div className="newSearch-people">
                            <div className="newSearch-filter-bar">
                                <button
                                    className={`newSearch-filter-button ${
                                        filters.relationshipDegree.includes(1) ? "active" : ""
                                    }`}
                                    onClick={() => handleRelationshipDegreeChange(1)}
                                >
                                    1촌
                                </button>
                                <button
                                    className={`newSearch-filter-button ${
                                        filters.relationshipDegree.includes(2) ? "active" : ""
                                    }`}
                                    onClick={() => handleRelationshipDegreeChange(2)}
                                >
                                    2촌
                                </button>
                                <button
                                    className={`newSearch-filter-button ${
                                        filters.relationshipDegree.includes(3) ? "active" : ""
                                    }`}
                                    onClick={() => handleRelationshipDegreeChange(3)}
                                >
                                    3촌
                                </button>
                            </div>

                            <div className="newSearch-team-member-results">
                                {isSearchLoading ? (
                                    <SearchLoading/>
                                ) : users.length === 0 ? (
                                    <div className="no-results-message">
                                        {searchTerm ? (
                                            <>
                                                검색어에 일치하는 인물이 없습니다.
                                                <br/>
                                                다른 검색어를 활용해 검색해보세요.
                                            </>
                                        ) : (
                                            <>검색 결과가 존재하지 않습니다.</>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {users.map((user, index) => (
                                            <NewUserSearchItem
                                                user={user.user}
                                                isNew={user.new_user}
                                                onAddRelationShip={() => {
                                                }}
                                                key={index}
                                                styleOv={((users.length - 1) == index) ? {borderBottom: 'none'} : null}
                                            />
                                        ))}
                                        {/* 마지막 유저 다음에 빈 div를 추가하고 ref 연결 */}
                                        <div ref={observerRef} style={{height: "1px"}}></div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* "게시물" 섹션: 게시물 탭이 활성화된 경우에 표시 */}
                    {selectedTab === 2 && (
                        <div className="newSearch-post">
                            <div className="newSearch-filter-bar" style={{paddingLeft: "20px", paddingRight: "20px"}}>
                                <button
                                    className={`newSearch-filter-button ${
                                        filters.relationshipDegree.includes(1) ? "active" : ""
                                    }`}
                                    onClick={() => handleRelationshipDegreeChange(1)}
                                >
                                    1촌
                                </button>
                                <button
                                    className={`newSearch-filter-button ${
                                        filters.relationshipDegree.includes(2) ? "active" : ""
                                    }`}
                                    onClick={() => handleRelationshipDegreeChange(2)}
                                >
                                    2촌
                                </button>
                                <button
                                    className={`newSearch-filter-button ${
                                        filters.relationshipDegree.includes(3) ? "active" : ""
                                    }`}
                                    onClick={() => handleRelationshipDegreeChange(3)}
                                >
                                    3촌
                                </button>
                            </div>

                            {isSearchLoading ? (
                                <SearchProjectLoading/>
                            ) : projects.length === 0 ? (
                                <div className="no-results-message">
                                    {searchTerm ? (
                                        <>
                                            검색어에 일치하는 게시물이 없습니다.
                                            <br/>
                                            다른 검색어를 활용해 검색해보세요.
                                        </>
                                    ) : (
                                        <>검색 결과가 존재하지 않습니다.</>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {projects &&
                                        projects.length > 0 &&
                                        projects.map((project) => (
                                            <ProjectResultView
                                                viewId={`proj-${project["project_id"]}`}
                                                key={project["project_id"]}
                                                projectId={project["project_id"]}
                                                updateProjectList={getProjects}
                                            />
                                        ))
                                    }
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default NewSearch;
