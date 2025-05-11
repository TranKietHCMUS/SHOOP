import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Home, GetUserData } from './pages';
import { AuthProvider } from './contexts/AuthContext'; // Import useAuth từ context
import FailRequest from './pages/FailRequest';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import StoresPage from './pages/StoresPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/get-user-data" element={<GetUserData />} />
          <Route path="/error" element={<FailRequest />} />
          <Route path="/result" element={<MainPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
