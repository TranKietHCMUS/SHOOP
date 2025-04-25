import React, { useState, useEffect } from 'react';
import RegisterForm from '../components/registerForm';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Carousel from '../components/Carousel';

const RegisterPage = () => {
  // Carousel images (replace with your actual image paths)
  const carouselImages = [
    '/imgs/hcm.png',
    '/imgs/hcm.png',
    '/imgs/hcm.png',
  ];

  const [currentImage, setCurrentImage] = useState(0);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
    <div className="flex flex-col bg-gradient-to-b from-primary-light to-[#C8E6D0]">
      {/* Main Section (Header, Carousel, and RegisterForm) */}
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Split Screen into Two Halves */}
        <div className="flex-grow flex">
          {/* Left Half - Carousel */}
          <div className="hidden lg:flex w-1/2 justify-center items-center">
            <Carousel />
          </div>

          {/* Right Half - Register Form */}
          <div className="w-full lg:w-1/2 flex justify-center items-center p-12">
            <div className="w-full max-w-2xl">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>

      {/* Footer (visible on scroll) */}
      <Footer />
    </div>
  );
};

export default RegisterPage;