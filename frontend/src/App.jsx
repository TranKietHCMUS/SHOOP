import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, GetUserData } from './pages';
import { AuthProvider } from './contexts/AuthContext';
import Phase1ResultPrototype from './pages/Phase1ResultPrototype';
import FailRequest from './pages/FailRequest';
import Phase1Result from './pages/Phase1Result';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/registerForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/get-user-data" element={<GetUserData />} />
          <Route path="/phase1-result-prototype" element={<Phase1ResultPrototype />} />
          <Route path="/error" element={<FailRequest />} />
          <Route path="/phase1-result" element={<Phase1Result />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
