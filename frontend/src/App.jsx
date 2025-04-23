import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SearchForm from './components/getUserInfoForm'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/registerForm'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchForm />} />
        <Route path="/auth/login" element={<LoginForm />} />
        <Route path="/auth/register" element={<RegisterForm />} />
      </Routes>
    </Router>
  )
}

export default App
