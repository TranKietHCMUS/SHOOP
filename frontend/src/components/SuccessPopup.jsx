import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const SuccessPopup = ({ message = "Thành công!", show = false }) => {
  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-500 ${
        show ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div className="bg-white border border-green-300 rounded-xl shadow-lg px-6 py-4 flex items-center space-x-3 animate-fade-in-down">
        <CheckCircleIcon className="h-7 w-7 text-green-500" />
        <span className="text-green-700 font-medium text-base">{message}</span>
      </div>
    </div>
  );
};

export default SuccessPopup;
