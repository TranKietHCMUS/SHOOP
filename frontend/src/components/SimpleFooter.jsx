import React from 'react';
import { Link } from 'react-router-dom';

const SimpleFooter = ({ minimal = false }) => {
  const currentYear = new Date().getFullYear();
  
  if (minimal) {
    return (
      <footer className="w-full py-4 bg-white text-gray-600">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <Link
              to="/"
              className="text-3xl font-extrabold tracking-wide"
              style={{ color: "#00B14F", textShadow: "0 0 4px #00B14F" }}
            >
              SHOOP
            </Link>
            </div>
            <div className="flex space-x-4 text-sm">
              <Link to="/about" className="hover:text-[#00B14F] transition-colors">About us</Link>
              <Link to="/privacy" className="hover:text-[#00B14F] transition-colors">Policy</Link>
              <Link to="/help" className="hover:text-[#00B14F] transition-colors">Help</Link>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-0">
              © {currentYear} SHOOP
            </p>
          </div>
        </div>
      </footer>
    );
  }
  
  // Standard footer for other pages
  return (
    <footer className="bg-white text-gray-700 py-3 mt-[1rem]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
          <Link
              to="/"
              className="text-3xl font-extrabold tracking-wide"
              style={{ color: "#00B14F", textShadow: "0 0 4px #00B14F" }}
            >
              SHOOP
            </Link>
            <p className="mt-1 text-sm text-gray-500">Empowering AI-driven Shopping</p>
          </div>
  
          {/* Links */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-12">
            <div>
              <h3 className="font-semibold text-base mb-2 text-[#00B14F]">Connection</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link to="/" className="hover:text-[#00B14F] transition-colors">
                    Home Page
                  </Link>
                </li>
                <li>
                  <Link to="/stores" className="hover:text-[#00B14F] transition-colors">
                    Stores
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#00B14F] transition-colors">
                    About us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2 text-[#00B14F]">Contact</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>Email: contact@shoop.com</li>
                <li>Tel: (84) 123-456-789</li>
                <li>Address: Ho Chi Minh City, Vietnam</li>
              </ul>
            </div>
          </div>
  
          {/* Social Icons */}
          <div className="flex space-x-3 text-[#00B14F]">
            {[
              ["fab fa-facebook-f", "https://facebook.com"],
              ["fab fa-twitter", "https://twitter.com"],
              ["fab fa-linkedin-in", "https://linkedin.com"],
              ["fab fa-instagram", "https://instagram.com"],
            ].map(([icon, url], idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#00B14F]/10 hover:bg-[#00B14F]/20 transition"
              >
                <i className={`${icon} text-lg`}></i>
              </a>
            ))}
          </div>
        </div>
  
        {/* Divider */}
        <div className="border-t border-gray-200 mt-6 pt-4 text-center text-sm text-gray-400">
          {/* Optional footer note */}
          {/* <p>
            © 2025 SHOOP. All rights reserved. Powered by
            <span className="font-semibold text-[#00B14F]"> AI </span>
          </p> */}
        </div>
      </div>
    </footer>
  );
  
};

export default SimpleFooter;