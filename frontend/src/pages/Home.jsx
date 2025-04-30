import React from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion'
import SimpleFooter from '../components/SimpleFooter';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  // const { isAuthenticated } = { isAuthenticated: true };

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login for this feature!', {
        duration: 3000,
        position: 'top-center',
      });
    } else {
      navigate('/get-user-data');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-[#C8E6D0]">
      <Toaster />
      <Header />
  
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          className="text-center pt-8 "
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4 pt-4">
            Smart Product Search
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Discover nearby stores with AI technology. We help you find the products you want quickly and accurately.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchClick}
            className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Start Search
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.button>
        </motion.div>
  
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 pb-10">
          {[
            {
              icon: "🎯",
              title: "Accurate Search",
              desc: "Use AI to understand your needs and suggest suitable stores.",
            },
            {
              icon: "📍",
              title: "Search by distance",
              desc: "Easily find stores within your range.",
            },
            {
              icon: "⚡",
              title: "Quick Results",
              desc: "Get results in seconds with a user-friendly interface.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut", delay: idx * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="text-primary text-2xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
      <SimpleFooter/>
    </div>
  );
};

export default Home; 