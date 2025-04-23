import React, { useState } from 'react';
import { LockClosedIcon, UserIcon, CalendarIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle registration logic here
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);
    console.log('Full Name:', fullName);
    console.log('Date of Birth:', dateOfBirth);
    console.log('Gender:', gender);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        {/* Logo */}
        <div className="mb-8">
          <img 
            style={{marginTop: "-5rem"}}
            src="/logo/with_w_bg.png"
            alt="Grab Logo"
            className="h-24 w-auto object-contain"
          />
        </div>

        <form onSubmit={handleSubmit}>
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <LockClosedIcon className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="mb-8 text-left">
            <label htmlFor="confirmPassword" className="block text-xl font-medium text-primary mb-3">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <LockClosedIcon className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Full Name Input */}
          <div className="mb-8 text-left">
            <label htmlFor="fullName" className="block text-xl font-medium text-primary mb-3">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="fullName"
                className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <UserIcon className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Date of Birth Input */}
          <div className="mb-8 text-left">
            <label htmlFor="dateOfBirth" className="block text-xl font-medium text-primary mb-3">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                id="dateOfBirth"
                className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              <CalendarIcon className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Gender Input */}
          <div className="mb-8 text-left">
            <label htmlFor="gender" className="block text-xl font-medium text-primary mb-3">
              Gender
            </label>
            <div className="relative">
              <select
                id="gender"
                className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left appearance-none"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="" disabled>Select your gender</option>
                <option value="male">Male (Nam)</option>
                <option value="female">Female (Nữ)</option>
                <option value="other">Other (Khác)</option>
              </select>
              <UserGroupIcon className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#00B14F] text-white py-4 rounded-lg text-lg font-medium hover:bg-[#009F47] transition-colors"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/auth/login" 
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