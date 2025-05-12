import React from 'react';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import RegisterForm from '../components/registerForm';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleFooter from '../components/SimpleFooter';
import SuccessPopup from '../components/SuccessPopup';
import { motion } from 'framer-motion';


const RegisterPage = () => {
  const navigate = useNavigate();
  const { isCreated } = useAuth();
  
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    if (isCreated) {
      setShowSuccess(true); // hiện popup
      const timeout = setTimeout(() => {
        setShowSuccess(false); // tắt popup
        navigate("/login"); // chuyển trang sau 2s
      }, 2000);
      return () => clearTimeout(timeout); // dọn dẹp timeout
    }
  }, [isCreated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary-light to-[#C8E6D0]">
      <Header />
      <main className="flex-grow flex items-center justify-center py-2 sm:py-3 md:py-4 px-2 sm:px-4">
        <SuccessPopup message="Register successfully" show={showSuccess} />
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
          <div className="hidden sm:block sm:w-1/2 p-2 flex items-center justify-center">
            <motion.div
              initial={{ x: 100, opacity: 0 }}  
              animate={{ x: 0, opacity: 1 }}   
              exit={{ x: -100, opacity: 0 }}   
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Carousel />
            </motion.div>
          </div>
          <div className="w-full md:w-1/2 p-2 flex items-center">
            <motion.div
              initial={{ x: 100, opacity: 0 }}  
              animate={{ x: 0, opacity: 1 }}   
              exit={{ x: -100, opacity: 0 }}   
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full"
            >
              <RegisterForm />
            </motion.div>
          </div>
        </div>
      </main>
      <SimpleFooter minimal={true} />
    </div>
  );
};

export default RegisterPage;