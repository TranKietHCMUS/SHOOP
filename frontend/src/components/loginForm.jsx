import React, { useState } from 'react';
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";
import { Link} from 'react-router-dom';
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
    <div className="w-full p-4 relative">

      <div className="bg-white p-6">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img src="/logo/no_bg_new.png" alt="Logo" className="h-24 w-auto object-contain" />
        </div>

        {/* Username Input */}
        <div className="mb-8 text-left">
          <label htmlFor="username" className="block text-xl font-medium text-primary mb-3">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              placeholder="Enter your username"
              value={loginInfo.username}
              onChange={(e) => setLoginInfo({ ...loginInfo, username: e.target.value })}
            />
            <UserIcon className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-8 text-left">
          <label htmlFor="password" className="block text-xl font-medium text-primary mb-3">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              placeholder="Enter your password"
              value={loginInfo.password}
              onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
            />
            <LockClosedIcon className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="mb-4 text-red-600 text-center">
            {loginError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-[#00B14F] text-white py-4 rounded-lg text-lg font-medium hover:bg-[#009F47] transition-colors"
        >
          {isLoginLoading ? "Loading your account..." : "Log In"}
        </button>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-base text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00B14F] hover:text-[#009F47] font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
