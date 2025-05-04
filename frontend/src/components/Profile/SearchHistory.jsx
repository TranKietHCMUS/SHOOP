import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2 } from 'lucide-react';

// Import components
import HistoryCard from './HistoryCard';
import DetailModal from './DetailModal';
import EmptyHistorySection from './EmptyHistorySection';


const SearchHistory = ({
  isLoading,
  searchHistory,
  openHistoryDetail,
  clearSearchHistory,
  navigate,
  user,
  setSearchHistory,
}) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [modalData, setModalData] = useState(null);

  const toggleExpand = (index) => {
    setExpandedCard(index === expandedCard ? null : index);
  };

  const viewDetails = (e, item) => {
    e.stopPropagation();
    setModalData(item);
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }} 
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Search History
        </h2>
        {searchHistory.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearSearchHistory}
            className="text-red-500 font-medium hover:text-red-600 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </motion.button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : searchHistory.length > 0 ? (
        <motion.div className="flex flex-col gap-4">
          {searchHistory.slice(0, 5).map((item, index) => (
            <HistoryCard
              key={index}
              item={item}
              index={index}
              expandedCard={expandedCard}
              toggleExpand={toggleExpand}
              viewDetails={viewDetails}
              openHistoryDetail={openHistoryDetail}
              user={user}
              setSearchHistory={setSearchHistory}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyHistorySection navigate={navigate} />
      )}

      <DetailModal modalData={modalData} closeModal={closeModal} />
    </motion.div>
  );
};

export default SearchHistory;