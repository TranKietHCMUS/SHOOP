import React from 'react';
import { motion } from 'framer-motion';

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

const SearchHistory = ({ 
  isLoading, 
  searchHistory, 
  openHistoryDetail, 
  clearSearchHistory, 
  navigate 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Search History</h2>
      {searchHistory.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearSearchHistory}
          className="text-red-500 font-medium hover:text-red-600"
        >
          Clear All
        </motion.button>
      )}
    </div>
    
    {isLoading ? (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    ) : searchHistory.length > 0 ? (
      <div className="space-y-4">
        {searchHistory.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-medium text-lg">{item.prompt}</h3>
                <p className="text-sm text-gray-500 mt-1">Searched on: {formatDate(item.timestamp)}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {item.address && item.address.length > 30 ? item.address.substring(0, 30) + '...' : item.address}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Radius: {item.radius}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Stores found:</span> {item.stores?.length || 0}
                  </p>
                </div>
              </div>
              <div className="flex mt-3 md:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openHistoryDetail(item)}
                  className="bg-primary text-white px-4 py-2 rounded-lg mr-2 hover:bg-primary-dark transition-colors text-sm"
                >
                  View Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/search?prompt=${encodeURIComponent(item.prompt)}&address=${encodeURIComponent(item.address)}&radius=${encodeURIComponent(item.radius)}&lat=${item.lat}&lng=${item.lng}`)}
                  className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary-light hover:text-white transition-colors text-sm"
                >
                  Search Again
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">🔍</div>
        <h3 className="text-xl font-medium text-gray-600 mb-2">No Search History</h3>
        <p className="text-gray-500 mb-4">You haven't made any searches yet.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Start Searching
        </motion.button>
      </div>
    )}
  </motion.div>
);

export default SearchHistory;