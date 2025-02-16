import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";
import CloseIcon from "../assets/closeIcon.svg";
import FriendCard from "../components/FriendCard";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Project from "./Project.jsx";
// import Project from "./NewProject/NewProject.jsx";
// import postImage from "../assets/NewProject/testimg.png";
import Gosearch from "../components/Gosearch.jsx";
import SuggestToast from "../components/Toast/SuggestToast.jsx";
import AddToHomePopup from "../components/AddToHomePopup/AddToHomePopup.jsx";
import HomeSuggestion from "../components/Suggestion/HomeSuggestion.jsx";


function Home() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const goToFriends = () => {
    navigate("/friends");
  };
  const goToInvite = () => {
    navigate("/invite");
  };
  const goToSetting = () => {
    navigate("/setting");
  };

  const [activeNav, setActiveNav] = useState("홈");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetFriends, setBottomSheetFriends] = useState([]);
  const [bottomSheetTitle, setBottomSheetTitle] = useState("");

  const [profileImage, setProfileImage] = useState(""); // 프로필 이미지

  const [isSuggestionOpen, setIsSuggestionOpen] = useState(null);

  // 프로필 이미지 가져오기
  const fetchProfileImage = async () => {
    try {
      const response = await api.get(`/api/profile/${userId}/`);
      setProfileImage(response.data.image); // Assuming the image field is 'image'
      const numOfKeywords = response.data.keywords.length;
      const numOfSkills = response.data.skills.length;
      if (numOfKeywords + numOfSkills < 2) {
        setIsSuggestionOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, []);

  const openBottomSheet = ({ friends, bottomSheetTitle }) => {
    setBottomSheetFriends(friends);
    setBottomSheetTitle(bottomSheetTitle);
    setIsBottomSheetOpen(true);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };

  const handleNavClick = (item) => {
    setActiveNav(item);
    if (item === "1촌") {
      goToFriends();
    } else if (item === "초대") {
      goToInvite();
    } else if (item === "설정") {
      goToSetting();
    }
  };

  return (
    <div className="home-container">
      {/** NEW : suggestion */}
      {
        (isSuggestionOpen != null) &&
        <SuggestToast
          isOpen={isSuggestionOpen}
          setIsOpen={setIsSuggestionOpen}
          userId={userId}
        />
      }
      <Header profileImage={profileImage} />
      <Navbar activeNav={activeNav} handleNavClick={handleNavClick} />
      <Gosearch/>
      <div className="home-incontainer">
        {/* Suggestion Area */}
        <HomeSuggestion />
        {/* --------------- */}
        {isBottomSheetOpen && (
          <div className="home-bottom-sheet-overlay" onClick={closeBottomSheet}>
            <div
              className="home-bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={CloseIcon}
                alt="닫기"
                className="home-close-icon"
                onClick={closeBottomSheet}
              />
              <h3>{bottomSheetTitle}</h3>
              <div className="home-bottom-sheet-content">
                {bottomSheetFriends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    isKeywordFriend={!!friend.sametag}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Project/>
      <AddToHomePopup/>
    </div>
  );
}

export default Home;
