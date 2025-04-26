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
    <div className="w-full p-4">
      <div className="bg-white p-6">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img 
            // style={{marginTop: "-5rem"}}
            src="/logo/no_bg_new.png"
            alt="Logo"
            className="h-24 w-auto object-contain"
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="mb-6 text-left">
            <label htmlFor="username" className="block text-lg font-medium text-primary mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                className="w-full p-3 pl-12 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                placeholder="Enter your username"
                value={registerInfo.username}
                onChange={(e) => setRegisterInfo({ ...registerInfo, username: e.target.value })}
              />
              <UserIcon className="h-8 w-8 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6 text-left">
            <label htmlFor="password" className="block text-lg font-medium text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                className="w-full p-3 pl-12 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                placeholder="Enter your password"
                value={registerInfo.password}
                onChange={(e) => setRegisterInfo({ ...registerInfo, password: e.target.value })}
              />
              <LockClosedIcon className="h-8 w-8 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6 text-left">
            <label htmlFor="confirmPassword" className="block text-lg font-medium text-primary mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 pl-12 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <LockClosedIcon className="h-8 w-8 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Full Name Input */}
          <div className="mb-6 text-left">
            <label htmlFor="fullName" className="block text-lg font-medium text-primary mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="fullName"
                className="w-full p-3 pl-12 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                placeholder="Enter your full name"
                value={registerInfo.fullName}
                onChange={(e) => setRegisterInfo({ ...registerInfo, fullName: e.target.value })}
              />
              <UserIcon className="h-8 w-8 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Date of Birth Input */}
          <div className="mb-6 text-left">
            <label htmlFor="dateOfBirth" className="block text-lg font-medium text-primary mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                id="dateOfBirth"
                className="w-full p-3 pl-12 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                value={registerInfo.dateOfBirth}
                onChange={(e) => setRegisterInfo({ ...registerInfo, dateOfBirth: e.target.value })}
              />
              <CalendarIcon className="h-8 w-8 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Gender Input */}
          <div className="mb-6 text-left">
            <label htmlFor="gender" className="block text-lg font-medium text-primary mb-2">
              Gender
            </label>
            <div className="relative">
              <select
                id="gender"
                className="w-full p-3 pl-12 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left appearance-none"
                value={registerInfo.gender}
                onChange={(e) => setRegisterInfo({ ...registerInfo, gender: e.target.value })}
              >
                <option value="" disabled>Select your gender</option>
                <option value="male">Male (Nam)</option>
                <option value="female">Female (Nữ)</option>
                <option value="other">Other (Khác)</option>
              </select>
              <UserGroupIcon className="h-8 w-8 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Error Message */}
          {registerError && (
            <div className="mb-4 text-red-600 text-center">
              {registerError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-[#00B14F] text-white py-3 rounded-lg text-base font-medium hover:bg-[#009F47] transition-colors"
          >
            {isRegisterLoading ? "Creating your account" : "Register"}
          </button>
        </form>

        {/* login Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-[#00B14F] hover:text-[#009F47] font-medium transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;