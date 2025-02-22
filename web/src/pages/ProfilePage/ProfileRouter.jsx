import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProfileSelf from "./ProfileSelf";
import ProfileOther from "./ProfileOther";
import api from "../../api";
import ProfileSelf2 from './ProfileSelf2';

const ProfileRouter = () => {
  const { id } = useParams(); // URL에서 {id}를 가져옴
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileSelf, setIsProfileSelf] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/user/current/");
      setCurrentUser(response.data);
      setIsProfileSelf(id === String(response.data.id));
      console.log("ProfileRouter.jsx", (id === String(response.data.id)));
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  if (isProfileSelf != null) {
    return (
      <div>{isProfileSelf ? <ProfileSelf2 /> : <ProfileOther userId={id} />}</div>
    );
  }
  
};

export default ProfileRouter;
