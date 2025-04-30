import React, { useState } from 'react';
import { LockClosedIcon, UserIcon, CalendarIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm = () => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, registerInfo, setRegisterInfo, registerError, setRegisterError, isRegisterLoading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (registerInfo.password != confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }
    register();
  };

  return (
    <div className="w-full relative">
      <div className="bg-gradient-to-br from-white to-gray-100 p-2 rounded-xl shadow-md border border-gray-100">
        {/* Logo with animation */}
        <div className="mb-2 flex justify-center">
          <img 
            src="/logo/no_bg_new.png" 
            alt="Logo" 
            className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300" 
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Username Input */}
            <div className="text-left col-span-2">
              <label htmlFor="username" className="block text-base font-medium text-gray-700">
                Username
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="username"
                  className="w-full p-1.5 pl-7 text-base rounded-lg border border-gray-200 focus:border-[#00B14F] focus:outline-none focus:ring-1 focus:ring-[#00B14F]/20 transition-all duration-300 bg-gray-50/50"
                  placeholder="Enter username"
                  value={registerInfo.username}
                  onChange={(e) => setRegisterInfo({ ...registerInfo, username: e.target.value })}
                />
                <UserIcon className="h-4 w-4 text-gray-400 group-focus-within:text-[#00B14F] absolute left-2 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Password Input */}
            <div className="text-left">
              <label htmlFor="password" className="block text-base font-medium text-gray-700">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  className="w-full p-1.5 pl-7 text-base rounded-lg border border-gray-200 focus:border-[#00B14F] focus:outline-none focus:ring-1 focus:ring-[#00B14F]/20 transition-all duration-300 bg-gray-50/50"
                  placeholder="Enter password"
                  value={registerInfo.password}
                  onChange={(e) => setRegisterInfo({ ...registerInfo, password: e.target.value })}
                />
                <LockClosedIcon className="h-4 w-4 text-gray-400 group-focus-within:text-[#00B14F] absolute left-2 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="text-left">
              <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full p-1.5 pl-7 text-base rounded-lg border border-gray-200 focus:border-[#00B14F] focus:outline-none focus:ring-1 focus:ring-[#00B14F]/20 transition-all duration-300 bg-gray-50/50"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <LockClosedIcon className="h-4 w-4 text-gray-400 group-focus-within:text-[#00B14F] absolute left-2 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Full Name Input */}
            <div className="text-left">
              <label htmlFor="fullName" className="block text-base font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="fullName"
                  className="w-full p-1.5 pl-7 text-base rounded-lg border border-gray-200 focus:border-[#00B14F] focus:outline-none focus:ring-1 focus:ring-[#00B14F]/20 transition-all duration-300 bg-gray-50/50"
                  placeholder="Enter full name"
                  value={registerInfo.fullName}
                  onChange={(e) => setRegisterInfo({ ...registerInfo, fullName: e.target.value })}
                />
                <UserIcon className="h-4 w-4 text-gray-400 group-focus-within:text-[#00B14F] absolute left-2 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Date of Birth Input */}
            <div className="text-left">
              <label htmlFor="dateOfBirth" className="block text-base font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="relative group">
                <input
                  type="date"
                  id="dateOfBirth"
                  className="w-full p-1.5 pl-7 text-base rounded-lg border border-gray-200 focus:border-[#00B14F] focus:outline-none focus:ring-1 focus:ring-[#00B14F]/20 transition-all duration-300 bg-gray-50/50"
                  value={registerInfo.dateOfBirth}
                  onChange={(e) => setRegisterInfo({ ...registerInfo, dateOfBirth: e.target.value })}
                />
                <CalendarIcon className="h-4 w-4 text-gray-400 group-focus-within:text-[#00B14F] absolute left-2 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Gender Input */}
            <div className="text-left">
              <label htmlFor="gender" className="block text-base font-medium text-gray-700">
                Gender
              </label>
              <div className="relative group">
                <select
                  id="gender"
                  className="w-full p-1.5 pl-7 text-base rounded-lg border border-gray-200 focus:border-[#00B14F] focus:outline-none focus:ring-1 focus:ring-[#00B14F]/20 transition-all duration-300 bg-gray-50/50 appearance-none"
                  value={registerInfo.gender}
                  onChange={(e) => setRegisterInfo({ ...registerInfo, gender: e.target.value })}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <UserGroupIcon className="h-4 w-4 text-gray-400 group-focus-within:text-[#00B14F] absolute left-2 top-1/2 transform -translate-y-1/2" />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {registerError && (
            <div className="text-red-600 text-center p-1 bg-red-50 rounded-lg border border-red-200 animate-pulse text-base">
              {registerError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00B14F] to-[#00C853] text-white py-1.5 rounded-lg text-base font-medium hover:shadow-md hover:shadow-green-200 active:scale-[0.98] transition-all duration-300"
          >
            {isRegisterLoading ? "Creating account..." : "Register"}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-base text-gray-600">
              Have an account?{' '}
              <Link to="/login" className="text-[#00B14F] font-medium">Log in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
