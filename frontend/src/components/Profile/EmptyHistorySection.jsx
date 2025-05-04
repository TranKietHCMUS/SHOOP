import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';


const EmptyHistorySection = ({ navigate }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="text-gray-400 text-4xl mb-4">🔍</div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">No Search History</h3>
      <p className="text-gray-500 mb-6">You haven't made any searches yet.</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md flex items-center mx-auto"
      >
        <Search className="w-5 h-5 mr-2" />
        Start Searching
      </motion.button>
    </motion.div>
  );
};

export default EmptyHistorySection;