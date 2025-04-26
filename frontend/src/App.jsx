import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Home, GetUserData } from './pages';
import { AuthProvider } from './contexts/AuthContext'; // Import useAuth từ context
import Phase1ResultPrototype from './pages/Phase1ResultPrototype';
import FailRequest from './pages/FailRequest';
import Phase1Result from './pages/Phase1Result';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/get-user-data" element={<GetUserData />} />
          <Route path="/phase1-result-prototype" element={<Phase1ResultPrototype />} />
          <Route path="/error" element={<FailRequest />} />
          <Route path="/phase1-result" element={<Phase1Result />} />
          <Route path="/result" element={<MainPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
