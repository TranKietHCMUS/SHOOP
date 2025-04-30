import React from 'react';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import LoginForm from '../components/loginForm';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleFooter from '../components/SimpleFooter';
import { motion } from 'framer-motion'

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // chuyển trang nếu đã đăng nhập
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-primary-light to-[#C8E6D0]">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden max-h-[calc(100vh-8rem)]">
          <div className="w-full md:w-1/2 p-2 flex items-center justify-center">
          <motion.div
              initial={{ x: 100, opacity: 0 }}  
              animate={{ x: 0, opacity: 1 }}   
              exit={{ x: -100, opacity: 0 }}   
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
            <Carousel />
            </motion.div>
          </div>
          <div className="w-full md:w-1/2 p-2 flex items-center">
            <motion.div
              initial={{ x: 100, opacity: 0 }}  
              animate={{ x: 0, opacity: 1 }}   
              exit={{ x: -100, opacity: 0 }}   
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
            <LoginForm />
            </motion.div>
          </div>
        </div>
      </main>
      <SimpleFooter minimal={true} />
    </div>
  );
};

export default LoginPage;