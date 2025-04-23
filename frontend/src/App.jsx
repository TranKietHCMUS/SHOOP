<<<<<<< Updated upstream
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SearchForm from './components/getUserInfoForm'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/registerForm'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, GetUserData } from './pages';
import { AuthProvider } from './contexts/AuthContext';
import Phase1ResultPrototype from './pages/Phase1ResultPrototype';
import FailRequest from './pages/FailRequest';
import Phase1Result from './pages/Phase1Result';
>>>>>>> Stashed changes
function App() {
  return (
<<<<<<< Updated upstream
    <Router>
      <Routes>
        <Route path="/" element={<SearchForm />} />
        <Route path="/auth/login" element={<LoginForm />} />
        <Route path="/auth/register" element={<RegisterForm />} />
      </Routes>
    </Router>
  )
=======
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/get-user-data" element={<GetUserData />} />
          <Route path="/phase1-result-prototype" element={<Phase1ResultPrototype />} />
          <Route path="/error" element={<FailRequest />} />
          <Route path="/phase1-result" element={<Phase1Result />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
>>>>>>> Stashed changes
}

export default App;
