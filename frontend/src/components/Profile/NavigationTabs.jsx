import React from 'react';

const NavigationTabs = ({ activeTab, setActiveTab }) => (
  <div className="border-b border-gray-200">
    <nav className="flex">
      <button
        onClick={() => setActiveTab('profile')}
        className={`px-6 py-4 text-lg font-medium ${
          activeTab === 'profile'
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Profile
      </button>
      <button
        onClick={() => setActiveTab('history')}
        className={`px-6 py-4 text-lg font-medium ${
          activeTab === 'history'
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Search History
      </button>
    </nav>
  </div>
);

export default NavigationTabs;