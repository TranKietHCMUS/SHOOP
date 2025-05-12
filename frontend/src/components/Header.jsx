import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Xử lý hiệu ứng scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchClick = (e) => {
  console.log(isAuthenticated); 
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('Please login for this feature!', {
        duration: 1000,
      }
      );
    }
  };

  return (
    <header className="bg-white shadow-md py-2 sticky top-0 z-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <img
                src="/logo/no_bg_new.png"
                alt="JobSync Logo"
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              {/* <span className="font-bold text-xl text-gray-800 hidden sm:block">
                Job<span className="text-[#00B14F]">Sync</span>
              </span> */}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className="text-base md:text-xl" active={location.pathname === "/"}>
              Home
            </NavLink>
            <NavLink 
              to="/get-user-data" 
              className="text-base md:text-xl" 
              active={location.pathname === "/get-user-data"}
              onClick={handleSearchClick}
            >
              Search
            </NavLink>
            <NavLink to="/stores" className="text-base md:text-xl" active={location.pathname.includes("/stores")}>
              Stores
            </NavLink>
            <NavLink to="/about" className="text-base md:text-xl" active={location.pathname === "/about"}>
              About
            </NavLink>
          </nav>

          {/* Auth Buttons / User Info - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-[#00B14F] px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 border border-transparent hover:border-[#00B14F]/20 hover:bg-[#00B14F]/5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-[#00B14F] to-[#00C853] hover:from-[#009F47] hover:to-[#00B14F] text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-[#00B14F] rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gradient-to-br from-[#00B14F]/80 to-[#00C853] flex items-center justify-center ring-2 ring-white">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user?.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {user?.fullName?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium text-sm hidden lg:block">
                      {user?.fullName || 'User'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hidden lg:block" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-10000">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00B14F]">
                      Your Profile
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00B14F]"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-96" : "max-h-0 overflow-hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg mt-2 rounded-b-lg">
          <MobileNavLink to="/" active={location.pathname === "/"}>
            Home
          </MobileNavLink>
          <MobileNavLink 
            to="/get-user-data" 
            active={location.pathname === "/get-user-data"}
            onClick={handleSearchClick}
          >
            Search
          </MobileNavLink>
          <MobileNavLink to="/stores" active={location.pathname.includes("/stores")}>
            Stores
          </MobileNavLink>
          <MobileNavLink to="/about" active={location.pathname === "/about"}>
            About
          </MobileNavLink>
          
          {!isAuthenticated ? (
            <div className="pt-4 flex flex-col space-y-2">
              <Link
                to="/login"
                className="text-gray-700 hover:bg-gray-50 hover:text-[#00B14F] px-3 py-2 rounded-lg text-base font-medium block text-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-[#00B14F] to-[#00C853] hover:from-[#009F47] hover:to-[#00B14F] text-white px-3 py-2 rounded-lg text-base font-medium block text-center"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-[#00B14F] flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="ml-3 text-gray-700 font-medium">
                  {user?.fullName || 'User'}
                </span>
              </div>
              <Link
                to="/profile"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00B14F]"
              >
                Your Profile
              </Link>
              <button
                onClick={logout}
                className="mt-1 block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Desktop Navigation Link
const NavLink = ({ to, children, active, onClick }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? "text-[#00B14F] bg-[#00B14F]/5" 
        : "text-gray-700 hover:text-[#00B14F] hover:bg-gray-50"
    }`}
    onClick={onClick}
  >
    {children}
  </Link>
);

// Mobile Navigation Link
const MobileNavLink = ({ to, children, active, onClick }) => (
  <Link
    to={to}
    className={`block px-3 py-2 rounded-lg text-base font-medium ${
      active 
        ? "text-[#00B14F] bg-[#00B14F]/5" 
        : "text-gray-700 hover:text-[#00B14F] hover:bg-gray-50"
    }`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Header;
