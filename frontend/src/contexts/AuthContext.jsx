import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token trong localStorage khi component mount
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Có thể thêm logic để lấy thông tin user từ token ở đây
      setUser({ id: 1 }); // Placeholder, thay thế bằng dữ liệu thực tế
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Thực hiện call API login ở đây
      // const response = await api.login(credentials);
      // const { token, user } = response.data;
      
      // Giả lập đăng nhập thành công
      const token = 'fake-token';
      const userData = { id: 1, name: 'User' };
      
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 