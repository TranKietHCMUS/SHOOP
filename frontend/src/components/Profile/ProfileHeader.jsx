import React from 'react';
import { motion } from 'framer-motion';

const formatDateOfBirth = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U';
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-red-200 text-red-700',
    'bg-blue-200 text-blue-700',
    'bg-green-200 text-green-700',
    'bg-purple-200 text-purple-700',
    'bg-yellow-200 text-yellow-700',
    'bg-pink-200 text-pink-700',
    'bg-indigo-200 text-indigo-700'
  ];
  const charSum = name ? name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
  return colors[charSum % colors.length];
};

const ProfileHeader = ({ user, handleLogout }) => (
  <div className="bg-primary text-white p-6 md:p-8">
    <div className="flex flex-col md:flex-row items-center">
      <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center ${getAvatarColor(user?.fullName)} font-bold text-4xl md:text-5xl shadow-md mb-4 md:mb-0 md:mr-6`}>
        {getInitial(user?.fullName)}
      </div>
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold">{user?.fullName || 'User Name'}</h1>
        <p className="text-primary-light">@{user?.username || 'username'}</p>
        <div className="flex flex-col md:flex-row md:space-x-4 mt-2">
          <p>Date of Birth: {formatDateOfBirth(user?.dateOfBirth || 'Not set')}</p>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4 mt-2">
          <p>Gender: {user?.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : 'Not set'}</p>
        </div>
      </div>
      <div className="ml-auto mt-4 md:mt-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Logout
        </motion.button>
      </div>
    </div>
  </div>
);

export default ProfileHeader;