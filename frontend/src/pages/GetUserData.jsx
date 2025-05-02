import React from 'react';
import Header from '../components/Header';
import GetUserInfoForm from '../components/getUserInfoForm';
import { motion } from 'framer-motion'
import SimpleFooter from '../components/SimpleFooter';

const GetUserData = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-[#C8E6D0]">
      <Header />
      <main className="h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
              initial={{ x: 100, opacity: 0 }}  
              animate={{ x: 0, opacity: 1 }}   
              exit={{ x: -100, opacity: 0 }}   
              transition={{ duration: 0.8, ease: "easeOut" }}
          >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-auto w-full max-w-6xl">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Column - Image */}
            <div className="md:w-1/2 relative md:h-1/2 group">
              <img
                src="/imgs/hcm.png"
                alt="Ho Chi Minh City"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-100"
              />
              {/* Overlay with text */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-500">
                <div className="text-center text-white transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <h2 className="text-3xl font-bold mb-4">Smart Search</h2>
                  <p className="text-lg">
                    Discover nearby stores with AI technology
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="md:w-1/2 px-5 flex items-center justify-center bg-white">
              <div className="w-full max-w-xl">
                <GetUserInfoForm />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      </main>
      <div className='my-7'>
        <SimpleFooter minimal={true} />
      </div>
    </div>
  );
};

export default GetUserData;