import React from 'react';
import Header from '../components/Header';
import GetUserInfoForm from '../components/getUserInfoForm';
import { motion } from 'framer-motion'
import SimpleFooter from '../components/SimpleFooter';

const GetUserData = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-light to-[#C8E6D0]">
      <Header />
      <main className="flex-grow flex items-center justify-center py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 lg:px-8">
        <motion.div
              initial={{ x: 100, opacity: 0 }}  
              animate={{ x: 0, opacity: 1 }}   
              exit={{ x: -100, opacity: 0 }}   
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full md:w-4/5 lg:w-3/4 xl:w-2/3 max-w-5xl mx-auto"
          >
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden w-full">
          <div className="flex flex-col md:flex-row">
            {/* Left Column - Image (Hidden on mobile) */}
            <div className="hidden sm:block md:w-1/2 relative group">
              <img
                src="/imgs/hcm.png"
                alt="Ho Chi Minh City"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-100"
              />
              {/* Overlay with text */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-500">
                <div className="text-center text-white transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 md:mb-4">Smart Search</h2>
                  <p className="text-sm sm:text-base md:text-lg">
                    Discover nearby stores with AI technology
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Form (Full width on mobile) */}
            <div className="w-full md:w-1/2 px-3 sm:px-4 md:px-5 py-3 sm:py-3 md:py-4 flex items-center justify-center bg-white">
              <div className="w-full max-w-md">
                <GetUserInfoForm />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      </main>
      <SimpleFooter minimal={true} />
    </div>
  );
};

export default GetUserData;