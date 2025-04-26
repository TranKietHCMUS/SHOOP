import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Home, GetUserData } from './pages';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth từ context
import Phase1ResultPrototype from './pages/Phase1ResultPrototype';
import FailRequest from './pages/FailRequest';
import Phase1Result from './pages/Phase1Result';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <PrivateRoute>
                <LoginPage />
              </PrivateRoute>
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/get-user-data" element={<GetUserData />} />
          <Route path="/phase1-result-prototype" element={<Phase1ResultPrototype />} />
          <Route path="/error" element={<FailRequest />} />
          <Route path="/phase1-result" element={<Phase1Result />} />
          <Route path="/result" element={<MainPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
