import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

const AuthContext = createContext();

const baseUrl = 'http://localhost:5000';

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
  const [isCreated, setIsCreated] = useState(false);

  useEffect(() => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp > currentTime) {
          setIsAuthenticated(true);
          const userData = JSON.parse(localStorage.getItem("user"));
          setUser(userData);
        }
        else {
          localStorage.removeItem("user");
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

  const login = async () => {
    setIsLoginLoading(true);
    setLoginError(null);
  
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(loginInfo)
      });
  
      const resData = await response.json();
  
      if (response.ok) {
        const user = resData.data?.user;
  
        if (user) {
          // Lưu user vào localStorage
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
          setIsAuthenticated(true);
        } else {
          setLoginError("Don't find user info in response");
        }
      } else {
        setLoginError(resData.error || "Failed to login");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Connection error to server");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const register = async () => {
    setIsRegisterLoading(true);
    setRegisterError(null);
  
    try {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(registerInfo)
      });
  
      const resData = await response.json();
  
      if (response.ok) {
        const user = resData.data?.user;
  
        if (user) {
          // Lưu user vào localStorage
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
          setIsCreated(true);
        } else {
          setRegisterError("Don't find user info in response");
        }
      } else {
        setRegisterError(resData.error || "Failed to register");
      }
    } catch (error) {
      console.error("Register error:", error);
      setRegisterError("Connection error to server");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{user, isAuthenticated, isCreated, setIsAuthenticated,
        registerInfo, registerError, isRegisterLoading, setRegisterError,
        loginInfo, loginError, isLoginLoading, login, setLoginInfo, register, setRegisterInfo}}>
      {children}
    </AuthContext.Provider>
  );
}; 