import api from "../api"
import { useState, useEffect } from "react" 
import SingleProject from "../pages/SingleProject/SingleProject"
import SingleProjectLogout from "../pages/SingleProject/SingleProjectLogout"

function ProtectedSingleProject() {
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const response = await api.get('/api/check-user-login/');
                const data = await response.data;
                setIsLogin(data.detail);
            } catch (error) {
                setIsLogin(false);
            } finally {
                setLoading(false);
            }
        };
        checkLogin();
    }, []);
  
    if (loading) {
      return <div>Loading...</div>;
    }

    return isLogin ? <SingleProject/> : <SingleProjectLogout/>;
}

export default ProtectedSingleProject