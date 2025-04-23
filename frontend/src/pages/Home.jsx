import React from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
//   const { isAuthenticated } = useAuth();
  const { isAuthenticated } = { isAuthenticated: true };

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này!', {
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
        <div className="text-center pt-20 pb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Product Search
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Discover nearby stores with AI technology. We help you find the products you want quickly and accurately.
          </p>
          <button
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
          </button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary text-2xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Accurate Search</h3>
            <p className="text-gray-600">
              Use AI to understand your needs and suggest suitable stores.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary text-2xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2">Search by distance</h3>
            <p className="text-gray-600">
              Easily find stores within your range.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary text-2xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Quick Results</h3>
            <p className="text-gray-600">
              Get results in seconds with a user-friendly interface.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 