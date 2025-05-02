import React from 'react';
import StoreInfo from './StoreInfo';
import RouteInfo from './RouteInfo';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = React.memo(({ 
  currentPhase, 
  selectedStore, 
  selectedRoute, 
  activeTab,
  onTabChange,
  searchResults,
  routes,
  isCollapsed,
  setIsCollapsed
}) => {
  console.log("Sidebar re-render"); 

  // Use the isCollapsed prop from parent component
  const toggleSidebar = () => {
    if (setIsCollapsed) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="relative h-full">
      <AnimatePresence initial={false}>
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 left-0"
          >
            <button 
              onClick={toggleSidebar}
              className="mt-4 ml-4 p-3 bg-white rounded-full shadow-md z-20 text-primary hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:rotate-12"
              aria-label="Expand sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="rounded-md h-full bg-white shadow-lg overflow-y-auto"
            style={{ width: '350px' }}
          >
            <div className="relative">
              <button 
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md z-20 text-primary hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:rotate-12"
                aria-label="Collapse sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </button>
            </div>

            {currentPhase === 2 && (
              <div className="border-b">
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
                <RouteInfo route={selectedRoute} routes={routes} />
              ) : (
                <StoreInfo store={selectedStore} stores={searchResults} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;