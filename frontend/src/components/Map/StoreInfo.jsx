import React, { useState } from 'react';
import CustomScrollbar from '../SubComponents/Scrollbar';
const scrollStyles = {
  maxHeight: '16rem', // tương đương max-h-64
  overflowY: 'auto',
  overflowX: 'hidden',
  background: 'white',
  borderRadius: '1rem',
};

// Style toàn cục để ẩn thanh cuộn mặc định nhưng giữ lại chức năng cuộn
const globalScrollbarStyles = `
  /* Ẩn thanh cuộn mặc định */
  ::-webkit-scrollbar {
    display: none;
    width: 0;
  }
  
  /* Chỉ hiển thị thanh cuộn đặc biệt */
  .show-scrollbar::-webkit-scrollbar {
    display: block;
    width: 8px;
  }
  
  .show-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .show-scrollbar::-webkit-scrollbar-thumb {
    background-color: #00B14F;
    border-radius: 4px;
  }
`;
const StoreInfo = ({ store }) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  if (!store) {
    return <div className="p-6 text-center text-gray-500">Select a store to view details</div>;
  }

  return (
    <div>
      <style>{globalScrollbarStyles}</style>
      <div className="max-w-3xl mx-auto bg-white">
        <header className="mb-6 flex flex-col sm:flex-row items-center sm:items-start">
          <img src={store.img_url} alt={store.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 mb-3 sm:mb-0 sm:mr-4" />
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-primary break-words">{store.name}</h3>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm">{store.address}</p>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 border-b border-gray-200 pb-1 whitespace-nowrap">
            {store.items.map((item, idx) => (
              <button
                key={idx}
                className={`px-2 sm:px-4 py-1 sm:py-2 font-medium text-xs sm:text-sm rounded-t-lg transition-colors
                  ${selectedItemIndex === idx 
                    ? 'bg-green-500 text-white border-b-2 border-green-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setSelectedItemIndex(idx)}
              >
                {item.product_name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Item Content */}
        <section>
          {store.items[selectedItemIndex] && (
            <div className="bg-gray-50 rounded-xl shadow-sm">
              <div className="mb-4 p-2 sm:p-4">
                <p className="text-gray-500 text-sm">
                  Quantity: {store.items[selectedItemIndex].quantity} {store.items[selectedItemIndex].unit}
                </p>
              </div>

              <CustomScrollbar className="max-h-10">
                <div className="space-y-2 p-2 sm:p-0">
                  {store.items[selectedItemIndex].candidates.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start w-full bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={c.img_url}
                        alt={c.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg mr-3 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-700 break-words w-full">{c.name}</p>
                        <p className="mt-1 text-base sm:text-lg font-bold text-green-600">
                          {c.price.toLocaleString()} đ/{c.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CustomScrollbar>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StoreInfo;