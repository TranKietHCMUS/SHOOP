import React from 'react';
import StoreInfo from './StoreInfo';
import RouteInfo from './RouteInfo';

const Sidebar = React.memo(({ 
  currentPhase, 
  selectedStore, 
  selectedRoute, 
  activeTab,
  onTabChange 
}) => {
  console.log("Sidebar re-render"); 

  return (
    <div className="w-1/4 border-2 border-primary m-4  bg-white shadow-lg overflow-y-auto">
      {currentPhase === 2 && (
        <div className="border-b ">
          <div className="flex">
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'store'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onTabChange('store')}
            >
              Stores
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'route'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onTabChange('route')}
            >
              Routes
            </button>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {currentPhase === 2 && activeTab === 'route' ? (
          <RouteInfo route={selectedRoute} />
        ) : (
          <StoreInfo store={selectedStore} />
        )}
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 