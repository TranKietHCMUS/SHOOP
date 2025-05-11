import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, ChevronRight, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_CONFIG } from '../../lib/config';
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

const HistoryCard = ({ item, index, expandedCard, toggleExpand, viewDetails, openHistoryDetail, onDeleteSuccess, user, setSearchHistory }) => {
  const deleteHistoryCard = async (e) => {
    e.stopPropagation();
    try {
      const userId = user?.id;
      
      if (!userId) 
        toast.error('User not found!');

      const response = await fetch(`/api/user/history/delete?index=${index}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete history card');
      }
      
      setSearchHistory((prevHistory) => prevHistory.filter((_, i) => i !== index));
      toast.success('History card deleted successfully!');
    } catch (error) {
      console.error('Error deleting history card:', error);
      toast.error('Failed to delete history card');
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`p-4 border rounded-xl shadow-md bg-white cursor-pointer hover:shadow-lg transition-shadow ${
        expandedCard === index ? 'ring-2 ring-primary border-primary border-opacity-30' : ''
      }`}
      onClick={() => toggleExpand(index)}
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.prompt}</h3>
      <div className="flex flex-wrap gap-3 mb-3">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formatDate(item.time)}
        </span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {item.address?.length > 30 ? item.address.substring(0, 30) + '...' : item.address}
        </span>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
          <ChevronRight className="w-3 h-3 mr-1" />
          Radius: {item.radius}
        </span>
      </div>

      <AnimatePresence>
        {expandedCard === index && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t flex justify-between"
          >
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => viewDetails(e, item)}
                className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center shadow-sm"
              >
                <Search className="w-4 h-4 mr-1" />
                View Details
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={deleteHistoryCard}
              className="text-sm border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-50 transition-colors flex items-center shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoryCard;