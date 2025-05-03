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

const HistoryModal = ({ 
  showHistoryModal, 
  selectedHistory, 
  closeHistoryModal, 
  openStoreDetail, 
  navigate 
}) => (
  showHistoryModal && selectedHistory && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Search Details</h2>
            <button 
              onClick={closeHistoryModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-lg font-medium">{selectedHistory.prompt}</p>
            <p className="text-sm text-gray-500">Searched on: {formatDate(selectedHistory.timestamp)}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-medium text-gray-700">Search Location</h3>
              <p className="text-gray-900">{selectedHistory.address}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Search Radius</h3>
              <p className="text-gray-900">{selectedHistory.radius}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Coordinates</h3>
              <p className="text-gray-900">Lat: {selectedHistory.lat}, Lng: {selectedHistory.lng}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Stores Found ({selectedHistory.stores?.length || 0})</h3>
            {selectedHistory.stores && selectedHistory.stores.length > 0 ? (
              <div className="space-y-4">
                {selectedHistory.stores.map((store, storeIndex) => (
                  <div key={storeIndex} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-3 bg-gray-200">
                        {store.store_img_url ? (
                          <img src={store.store_img_url} alt={store.store_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary-light text-white font-bold">
                            {store.store_name?.charAt(0) || 'S'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{store.store_name}</h4>
                        <p className="text-sm text-gray-500">{store.store_address}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openStoreDetail(store)}
                        className="ml-auto bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-dark"
                      >
                        View Items
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No stores found for this search.</p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={closeHistoryModal}
              className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary-light hover:text-white transition-colors"
            >
              Close
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/search?prompt=${encodeURIComponent(selectedHistory.prompt)}&address=${encodeURIComponent(selectedHistory.address)}&radius=${encodeURIComponent(selectedHistory.radius)}&lat=${selectedHistory.lat}&lng=${selectedHistory.lng}`)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Search Again
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
);

export default HistoryModal;