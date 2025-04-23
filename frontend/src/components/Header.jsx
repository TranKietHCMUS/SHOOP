import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  // TODO: Replace with actual auth state
  const isAuthenticated = false;

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src="/logo/no_bg.png"
                alt="Grab Logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Auth Buttons */}
          {!isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-md text-sm font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 