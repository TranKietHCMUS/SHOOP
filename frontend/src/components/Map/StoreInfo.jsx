import React from 'react';

const StoreInfo = ({ store }) => {
  if (!store) {
    return (
      <div className="p-4 text-center text-gray-500">Choose a store to see details
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-bold text-lg">{store.name}</h3>
      <p className="text-gray-600 mt-2">{store.address}</p>
      <div className="mt-4">
        <h4 className="font-semibold">Products:</h4>
        <ul className="list-disc list-inside mt-2">
          {store.products?.map((product, index) => (
            <li key={index} className="text-gray-700">{product}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StoreInfo;
