import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, ShoppingBag } from 'lucide-react';

const DetailModal = ({ modalData, closeModal }) => {
  const [activeTab, setActiveTab] = useState('stores');
  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }
  };
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } }
  };

  if (!modalData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdropVariants}
        className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <motion.div
          variants={modalVariants}
          className="bg-white rounded-xl shadow-xl w-11/12 md:w-4/5 lg:w-3/4 max-w-5xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800">
              {modalData.prompt}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Modal tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-6 text-center font-medium transition-colors flex items-center justify-center ${
                activeTab === 'stores'
                  ? 'text-primary border-b-2 border-primary bg-primary bg-opacity-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('stores')}
            >
              <Store className="w-5 h-5 mr-2" />
              Stores ({modalData.stores ? modalData.stores.length : 0})
            </button>
            <button
              className={`flex-1 py-3 px-6 text-center font-medium transition-colors flex items-center justify-center ${
                activeTab === 'products'
                  ? 'text-primary border-b-2 border-primary bg-primary bg-opacity-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('products')}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Products
            </button>
          </div>
          {/* Modal content with conditional rendering based on active tab */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'stores' ? (
              <StoresTab stores={modalData.stores} />
            ) : (
              <ProductsTab stores={modalData.stores} />
            )}
          </div>
          {/* Modal footer */}
          <div className="border-t p-4 bg-gray-50 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={closeModal}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Tab content for stores
 * @param {Object} props - Component props
 * @param {Array} props.stores - Stores data
 * @returns {JSX.Element} StoresTab component
 */
const StoresTab = ({ stores = [] }) => {
  // Nhóm các cửa hàng theo name (loại cửa hàng)
  const groupedStores = {};
  
  stores.forEach(store => {
    if (!store.name) return;
    
    if (!groupedStores[store.name]) {
      groupedStores[store.name] = {
        name: store.name,
        img_url: store.img_url,
        stores: []
      };
    }
    
    groupedStores[store.name].stores.push(store);
  });
  
  return (
    <div className="space-y-6">
      {Object.values(groupedStores).map((group, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.05 }}
          className="border rounded-lg shadow-sm overflow-hidden"
        >
          <div className="flex items-center p-4 bg-gray-50 border-b">
            {group.img_url ? (
              <img 
                src={group.img_url} 
                alt={`${group.name} logo`} 
                className="w-8 h-8 object-cover rounded-full mr-3"
              />
            ) : (
              <Store className="w-6 h-6 text-primary mr-3" />
            )}
            <div>
              <h4 className="font-semibold text-gray-800">{group.name}</h4>
              <p className="text-xs text-gray-500">{group.stores.length} {group.stores.length > 1 ? 'stores' : 'store'}</p>
            </div>
          </div>
          
          <div className="grid gap-4 p-4 md:grid-cols-2">
            {group.stores.map((store, storeIdx) => (
              <motion.div
                key={storeIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: storeIdx * 0.05 }}
                className="p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <p className="text-gray-700 mb-2 font-medium">{store.address}</p>
                <div className="text-sm text-gray-500">
                  <p>{store.items ? store.items.length : 0} products available</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Tab content for products
 * @param {Object} props - Component props
 * @param {Array} props.stores - Stores data with products
 * @returns {JSX.Element} ProductsTab component
 */
const ProductsTab = ({ stores = [] }) => {
  // Nhóm các cửa hàng theo name (loại cửa hàng)
  const groupedStores = {};
  
  stores.forEach(store => {
    if (!store.name) return;
    
    // Tạo nhóm mới nếu chưa tồn tại
    if (!groupedStores[store.name]) {
      groupedStores[store.name] = {
        name: store.name,
        img_url: store.img_url,
        storeCount: 0,
        items: []
      };
    }
    
    // Thêm số lượng cửa hàng
    groupedStores[store.name].storeCount += 1;
    
    // Chỉ thêm sản phẩm nếu chưa tồn tại trong nhóm
    if (store.items && store.items.length > 0) {
      store.items.forEach(item => {
        // Kiểm tra xem sản phẩm đã tồn tại trong nhóm chưa
        const existingProduct = groupedStores[store.name].items.find(
          existing => existing.product_name === item.product_name
        );
        
        if (!existingProduct) {
          groupedStores[store.name].items.push(item);
        }
      });
    }
  });
  
  return (
    <div className="space-y-8">
      {Object.values(groupedStores).map((storeGroup, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
        >
          <div className="flex items-center mb-3 pb-2 border-b">
            {storeGroup.img_url ? (
              <img 
                src={storeGroup.img_url} 
                alt={`${storeGroup.name} logo`} 
                className="w-8 h-8 object-cover rounded-full mr-3"
              />
            ) : (
              <Store className="w-6 h-6 text-primary mr-3" />
            )}
            <div>
              <h4 className="font-semibold text-gray-800">{storeGroup.name}</h4>
              <p className="text-xs text-gray-500">{storeGroup.storeCount} {storeGroup.storeCount > 1 ? 'stores' : 'store'}</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {storeGroup.items.map((product, productIdx) => (
              <motion.div
                key={productIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: productIdx * 0.05 }}
                className="p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                {/* Hiển thị thông tin yêu cầu sản phẩm */}
                <p className="font-medium text-gray-800 mb-2">{product.product_name}</p>
                <p className="text-xs italic text-gray-500 mb-3">
                  Requirement: {product.quantity} {product.unit}
                </p>
                
                {/* Hiển thị danh sách tất cả các candidates */}
                {product.candidates && product.candidates.length > 0 ? (
                  <div className="space-y-3">
                    {product.candidates.map((candidate, candidateIdx) => (
                      <div key={candidateIdx} className="flex items-center border-t pt-2 first:border-t-0 first:pt-0">
                        {candidate.img_url ? (
                          <img
                            src={candidate.img_url}
                            alt={candidate.name || product.product_name}
                            className="w-16 h-16 object-cover rounded-md mr-3 bg-gray-100"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-md mr-3 flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {candidate.name || "Unnamed Product"}
                          </p>
                          {candidate.unit && (
                            <p className="text-sm text-gray-600">{candidate.unit}</p>
                          )}
                          {candidate.price && (
                            <p className="text-sm font-medium text-primary mt-1">
                              {candidate.price.toLocaleString()}₫
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 text-gray-500">
                    Không có sản phẩm thay thế
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DetailModal;