import React, { useState } from 'react';
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Username:', username);
    console.log('Password:', password);
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

        {/* username Input */}
        <div className="mb-8 text-left">
          <label htmlFor="username" className="block text-xl font-medium text-primary mb-3">
            Username
          </label>
          <div className="relative">
            <input
              type="username"
              id="username"
              className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setusername(e.target.value)}
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

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#00B14F] text-white py-4 rounded-lg text-lg font-medium hover:bg-[#009F47] transition-colors"
        >
          Log In
        </button>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-base text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-[#00B14F] hover:text-[#009F47] font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;