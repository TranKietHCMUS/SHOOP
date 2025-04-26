import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import RegisterForm from '../components/registerForm';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessPopup from '../components/SuccessPopUp';

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
    <div className="min-h-screen bg-gradient-to-b from-[#E6F3EA] to-[#C8E6D0]">
      <div className="min-h-screen flex flex-col">
      <Header />
          <main className="flex-grow flex items-center justify-center py-12">
          <SuccessPopup message="Đăng ký thành công!" show={showSuccess} />
          <div className="w-1/2 mx-auto px-4 bg-white rounded-xl shadow-lg flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-4 flex items-center justify-center">
              <Carousel />
              </div>
              <div className="w-full md:w-1/2 p-4 flex items-center">
              <RegisterForm />
              </div>
          </div>
          </main>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;