import React from 'react';
import { motion } from 'framer-motion';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(price);
};

const StoreModal = ({ showStoreModal, selectedStore, closeStoreModal }) => (
  showStoreModal && selectedStore && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Store Details</h2>
            <button 
              onClick={closeStoreModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-4 mb-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 bg-gray-200 flex-shrink-0">
              {selectedStore.img_url || selectedStore.store_img_url ? (
                <img 
                  src={selectedStore.img_url || selectedStore.store_img_url} 
                  alt={selectedStore.name || selectedStore.store_name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary-light text-white font-bold">
                  {(selectedStore.name || selectedStore.store_name)?.charAt(0) || 'S'}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-medium">{selectedStore.name || selectedStore.store_name}</h3>
              <p className="text-gray-500">{selectedStore.address || selectedStore.store_address}</p>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lat: {selectedStore.lat}, Lng: {selectedStore.lng}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Available Products</h3>
            
            {selectedStore.items && selectedStore.items.length > 0 ? (
              <div className="space-y-6">
                {selectedStore.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-primary">
                        Requested: {item.quantity} {item.unit} of {item.product_name}
                      </h4>
                    </div>
                    
                    {item.candidates && item.candidates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {item.candidates.map((candidate, candidateIndex) => (
                          <div key={candidateIndex} className="bg-white rounded-lg shadow p-3 border border-gray-100">
                            <div className="h-32 w-full rounded overflow-hidden mb-2 bg-gray-100">
                              {candidate.img_url ? (
                                <img 
                                  src={candidate.img_url} 
                                  alt={candidate.name} 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-image.png';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <h5 className="font-medium text-gray-800">{candidate.name}</h5>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm text-gray-500">{candidate.category}</span>
                              <span className="text-sm font-semibold text-green-600">{formatPrice(candidate.price)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {candidate.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-2">No matching products found.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No items available for this store.</p>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={closeStoreModal}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
);

export default StoreModal;