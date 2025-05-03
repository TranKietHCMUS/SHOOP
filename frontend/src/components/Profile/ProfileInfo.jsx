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

const ProfileInfo = ({ user, setActiveTab }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              value={user?.username || ''}
              className="w-full p-3 bg-gray-100 rounded-lg"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              value={user?.fullName || ''}
              className="w-full p-3 bg-gray-100 rounded-lg"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
            <input
              type="text"
              value={formatDateOfBirth(user?.dateOfBirth || '')}
              className="w-full p-3 bg-gray-100 rounded-lg"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
            <input
              type="text"
              value={user?.gender || ''}
              className="w-full p-3 bg-gray-100 rounded-lg"
              readOnly
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="font-medium">Change Password</h3>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Change
            </motion.button>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="font-medium">Update Information</h3>
              <p className="text-sm text-gray-500">Update your personal information</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Update
            </motion.button>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="font-medium">Search History</h3>
              <p className="text-sm text-gray-500">View your search history</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('history')}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              View History
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default ProfileInfo;