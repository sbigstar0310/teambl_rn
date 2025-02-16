import {Navigate, useParams} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import "../styles/Experience/Experience.css";
import ExperienceInvitation from "../pages/Experience/ExperienceInvitation";
import ProtectedRoute from "./ProtectedRoute";

function ProtectedExpInvitationRoute({ children }) {

    const { invitationCode } = useParams();

    /** checking loading */
    const [isLoading, setIsLoading] = useState(true);

    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isCodeValid, setIsCodeValid] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
        checkInvitationCodeValidity();
    }, [])

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken
            }); 
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    }

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    }

    const checkInvitationCodeValidity = async () => {
        await setIsLoading(true);
        try {
            await api.get(`/api/experience-detail/${invitationCode}/`);
            await setIsCodeValid(true);
        } catch (e) {
            console.log(e);
            await setIsCodeValid(false);
        }
        await setIsLoading(false);
    };

    if ((isAuthorized == null) || isLoading || (isCodeValid == null)) {
        return (
            <div className="exp-loader-container">
                <div className="exp-loader" />
            </div>
        );
    }

    if (!isCodeValid) {
        alert("비정상적인 접근입니다.");
        return (<Navigate to="/login" />);
    }

    if (isAuthorized) {
        /** to the accpet or reject page. */
        return (
            <ProtectedRoute>
                <ExperienceInvitation
                    invitationCode={invitationCode}
                />
            </ProtectedRoute>
        );
    }

    if (!isAuthorized) {
        /** to the welcome page (children) */
        return children;
    }
}

export default ProtectedExpInvitationRoute