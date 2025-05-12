import React from 'react';
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const {
    loginInfo, setLoginInfo, login, isLoginLoading, loginError
  } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login();
  };

  return (
    <div className="w-full relative">
      <div className="bg-gradient-to-br from-white to-gray-100 p-3 sm:p-4 md:p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
        {/* Logo with animation */}
        <div className="mb-3 md:mb-4 flex justify-center">
          <img 
            src="/logo/no_bg_new.png" 
            alt="Logo" 
            className="h-16 sm:h-18 md:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" 
          />
        </div>

        {/* Username Input */}
        <div className="mb-3 md:mb-4 text-left">
          <label htmlFor="username" className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Username
          </label>
          <div className="relative group">
            <input
              type="text"
              id="username"
              className="w-full p-2 md:p-3 pl-10 md:pl-12 text-sm md:text-base rounded-xl border-2 border-gray-200 focus:border-[#00B14F] focus:outline-none focus:ring-2 focus:ring-[#00B14F]/20 transition-all duration-300 bg-gray-50/50 backdrop-blur-sm"
              placeholder="Enter your username"
              value={loginInfo.username}
              onChange={(e) => setLoginInfo({ ...loginInfo, username: e.target.value })}
            />
            <UserIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-focus-within:text-[#00B14F] absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300" />
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 border-2 border-[#00B14F] -m-0.5"></div>
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-3 md:mb-4 text-left">
          <label htmlFor="password" className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Password
          </label>
          <div className="relative group">
            <input
              type="password"
              id="password"
              className="w-full p-2 md:p-3 pl-10 md:pl-12 text-sm md:text-base rounded-xl border-2 border-gray-200 focus:border-[#00B14F] focus:outline-none focus:ring-2 focus:ring-[#00B14F]/20 transition-all duration-300 bg-gray-50/50 backdrop-blur-sm"
              placeholder="Enter your password"
              value={loginInfo.password}
              onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
            />
            <LockClosedIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-focus-within:text-[#00B14F] absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300" />
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 border-2 border-[#00B14F] -m-0.5"></div>
          </div>
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="mb-3 text-red-600 text-center p-2 bg-red-50 rounded-lg border border-red-200 animate-pulse text-xs sm:text-sm">
            {loginError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-[#00B14F] to-[#00C853] text-white py-2 md:py-3 rounded-xl text-sm md:text-base font-medium hover:shadow-lg hover:shadow-green-200 active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10">
            {isLoginLoading ? "Loading your account..." : "Log In"}
          </span>
          <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
        </button>

        {/* Register Link */}
        <div className="mt-3 md:mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00B14F] hover:text-[#009F47] font-medium relative group transition-colors">
              Register
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00B14F] group-hover:w-full transition-all duration-300"></span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
