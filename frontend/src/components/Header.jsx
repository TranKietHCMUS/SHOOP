import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src="/logo/no_bg_new.png"
                alt="Grab Logo"
                className="h-14 w-auto"
              />
            </Link>
          </div>

          {/* Auth Buttons / User Info */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
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
              </>
            ) : (
              <>
                <Link to="/profile" className="flex items-center space-x-2 group">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center group-hover:ring-2 group-hover:ring-primary transition">
                    <span className="text-white font-bold">
                      {user?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium text-sm group-hover:text-primary transition">
                    {user?.fullName || 'User'}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-md transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
