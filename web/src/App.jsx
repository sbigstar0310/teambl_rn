import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Start from "./pages/Start";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Certify from "./pages/Certify";
import End from "./pages/End";
import Project from "./pages/Project";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Friend from "./pages/Friend";
import Invite from "./pages/Invite";
import Search from "./pages/Search";
import Welcome from "./pages/Welcome";
import NewSearch from "./pages/NewSearchPage/NewSearch";
import ProfileRouter from "./pages/ProfilePage/ProfileRouter";
import EditProfile from "./pages/ProfilePage/EditProfile";
import Notification from "./pages/Notification";
import Setting from "./pages/Setting";
import ResetPassword from "./pages/ResetPasswordPage/ResetPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordPage/ResetPasswordConfirm";
import FriendOther from "./pages/FriendOther";
import AddProject from "./pages/Project/AddProject";
import FloatingButton from "./components/FloatingButton";
import Setting2 from "./pages/Setting2";
import EditProject from "./pages/Project/EditProject";
import ProjectFriend from "./pages/Project/ProjectFriend";
import ProtectedSingleProject from "./components/ProtectedSingleProject";
import LikedProject from "./pages/LikedProject/LikedProject";
import AddExperience from "./pages/Experience/AddExperience";
import EditExperience from "./pages/Experience/EditExperience";
import ProjectLiked from "./pages/Project/ProjectLiked";
import IsLoginGoHome from "./components/IsLoginGoHome";
import ExperienceWelcome from "./pages/Experience/ExperienceWelcome";
import ProtectedExpInvitationRoute from "./components/ProtectedExpInvitaionRoute";

import ConfirmExperience from "./pages/Experience/ConfirmExperience";
import ExperienceMember from "./pages/Experience/ExperienceMember";

import Conversations from './pages/Conversations';
import InvitationCerfity from "./pages/Experience/InvitationCerfity";
import InvitationRegister from "./pages/Experience/InvitationRegister";
import RegisterWelcome from "./pages/Experience/RegisterWelcome";
import RegisterAloneCertify from "./pages/RegisterAlone/RegisterAloneCertify";
import RegisterAlone from "./pages/RegisterAlone/RegisterAlone";
import RegisterAloneWelcome from "./pages/RegisterAlone/RegisterAloneWelcome";
import SuggestionDetail from "./pages/Suggestion/SuggestionDetail";

function Logout() {
  localStorage.clear(); // 저장된 token 정보 없애기
  return <Navigate to="/login/" />; // 로그인 페이지로 이동시키기
}

// Custom route to check for the invited status
function ProtectedRegisterRoute({ children }) {
  const invited = localStorage.getItem("invited") === "true";
  console.log("Invited status in ProtectedRegisterRoute:", invited);
  if (invited) {
    return children;
  } else {
    return <Navigate to="/logout" />;
  }
}

function App() {
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const updateUnreadCount = (newCount) => {
    setUnreadNotifications(newCount);
  };

  return (
    <BrowserRouter>
      {/** floating button */}
      <FloatingButton />
      <Routes>
        <Route path="/" element={<Start />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/login"
          element={
            <IsLoginGoHome>
              <Login />
            </IsLoginGoHome>
          } />
        <Route
          path="/register-alone/certify"
          element={
            <IsLoginGoHome>
              <RegisterAloneCertify />
            </IsLoginGoHome>
          }
        />
        <Route
          path="/register-alone/register"
          element={
            <IsLoginGoHome>
              <RegisterAlone />
            </IsLoginGoHome>
          }
        />
        <Route
          path="/register-alone/welcome"
          element={
            <RegisterAloneWelcome />
          }
        />
        <Route path="/logout" element={<Logout />} />
        <Route path="/password-reset" element={<ResetPassword />} />
        <Route
          path="/password-reset-confirm"
          element={<ResetPasswordConfirm />}
        /> */}
        <Route
          path="/welcome"
          element={
            // <ProtectedRegisterRoute>
            <Welcome />
            // </ProtectedRegisterRoute>
          }
        />
        <Route
          path="/certify"
          element={
            <ProtectedRegisterRoute>
              <Certify />
            </ProtectedRegisterRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRegisterRoute>
              <Register />
            </ProtectedRegisterRoute>
          }
        />
        <Route
          path="/end"
          element={
            <ProtectedRegisterRoute>
              <End />
            </ProtectedRegisterRoute>
          }
        />
        {/* <Route
          path="/projects" exact
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/add" exact
          element={
            <ProtectedRoute>
              <AddProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/liked" exact
          element={
            <ProtectedRoute>
              <LikedProject />
            </ProtectedRoute>
          }
        />
        <Route path="/projects/:projectId" exact element={<ProtectedSingleProject />} />
        <Route
          path="/projects/:projectId/edit" exact
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/friends" exact
          element={
            <ProtectedRoute>
              <ProjectFriend />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/liked" exact
          element={
            <ProtectedRoute>
              <ProjectLiked />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friend />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invite"
          element={
            <ProtectedRoute>
              <Invite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suggestion"
          element={
            <ProtectedRoute>
              <SuggestionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <NewSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfileRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id/friends"
          element={
            <ProtectedRoute>
              <FriendOther />
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience/add"
          element={
            <ProtectedRoute>
              <AddExperience />
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience/confirm"
          element={
            <ProtectedRoute>
              <ConfirmExperience />
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience/:expId/edit"
          element={
            <ProtectedRoute>
              <EditExperience />
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience/:userId/:expId/people"
          element={
            <ProtectedRoute>
              <ExperienceMember />
            </ProtectedRoute>
          }
        /> */}
        {/** This path may depend on the url the backend server have generated. */}
        <Route
          path="/experience/welcome/:invitationCode"
          element={
            <ProtectedExpInvitationRoute>
              <ExperienceWelcome />
            </ProtectedExpInvitationRoute>
          }
        />
        <Route
          path="/experience/invitation/certify/:invitationCode/:inviter"
          element={
            <InvitationCerfity />
          }
        />
        <Route
          path="/experience/invitation/register/:invitationCode/:inviter"
          element={
            <InvitationRegister />
          }
        />
        <Route
          path="/experience/invitation/register/welcome"
          element={
            <RegisterWelcome />
          }
        />
        {/* <Route
          path="/editprofile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <ProtectedRoute>
              <Notification updateUnreadCount={updateUnreadCount} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <Setting2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <Conversations />
            </ProtectedRoute>
          }
        /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
