import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Carousel from '../components/Carousel';

const LoginPage = () => {
  return (
    <div className="flex flex-col bg-gradient-to-b from-primary-light to-[#C8E6D0]">
      {/* Main Section (Header, Carousel, and LoginForm) */}
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Split Screen into Two Halves */}
        <div className="flex-grow flex">
          {/* Left Half - Carousel */}
          <div className="hidden lg:flex w-1/2 justify-center items-center">
            <Carousel />
          </div>

          {/* Right Half - Login Form */}
          <div className="w-full lg:w-1/2 flex justify-center items-center p-12">
            <div className="w-full max-w-2xl">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      {/* Footer (visible on scroll) */}
      <Footer />
    </div>
  );
};

export default LoginPage;