import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp > currentTime) {
          setIsAuthenticated(true);

          setUser({
            id: payload.id,
            username: payload.username,
            fullName: payload.fullName,
            gender: payload.gender,
            dateOfBirth: payload.dateOfBirth,
        });
        }
        else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
        console.error("Error:", error);
        setUser(null);
    }
  }, [])

  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    username: "",
    password: "",
    fullName: "",
    gender: "",
    dateOfBirth: ""
  });

  const [loginError, setLoginError] = useState(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState({
    username: "",
    password: ""
  });

  const updateLoginInfo = useCallback((info) => {
    setLoginInfo(info);
  }, []);

  const loginUser = useCallback( async(e) => {
      // setIsLoginLoading(true);
      // setLoginError(null);

      // const response = await postLoginOrRegister(`${baseUrl}/auth/login/`, JSON.stringify(loginInfo));

      // setIsLoginLoading(false);
      // if (response.error) return setLoginError(response);

      // localStorage.setItem("User", JSON.stringify(response['user']));
      // localStorage.setItem('token', response['accessToken']);
      // setUser(response['user']);
      const token = 'fake-token';
      const userData = { id: 1, name: 'User' };
      
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(userData);
  }, [loginInfo])

  const updateRegisterInfo = useCallback((info) => {
      setRegisterInfo(info);
  }, []);

  const registerUser = useCallback( async(e) => {
      e.preventDefault();
      setIsRegisterLoading(true);
      setRegisterError(null);

      const response = await postLoginOrRegister(`${baseUrl}/auth/register/`, JSON.stringify(registerInfo));

      setIsRegisterLoading(false);
      if (response.error) return setRegisterError(response);

  }, [registerInfo]);

  const logoutUser = useCallback( async(e) => {
      const response = await getRequest(`${baseUrl}/auth/logout?user_id=${user?.id}`);
      if (response?.error) {
          console.log(response?.error);
          return;
      }
      localStorage.removeItem("User");
      localStorage.removeItem("token");
      setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{user, isAuthenticated,
        registerInfo, updateRegisterInfo, registerUser, registerError, isRegisterLoading,
        loginInfo, updateLoginInfo, loginError, loginUser, isLoginLoading,
        logoutUser}}>
      {children}
    </AuthContext.Provider>
  );
}; 