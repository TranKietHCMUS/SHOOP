import React, { useState } from 'react';
import { QuestionMarkCircleIcon, MapPinIcon } from "@heroicons/react/24/solid";


const SearchForm = () => {
  const [distance, setDistance] = useState(5); // Default 5km
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Search query:', searchQuery);
    console.log('Distance:', distance);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        {/* Logo */}
        <div className="mb-8">
          <img 
            style={{marginTop: "-5rem"}}
            src="/logo/with_w_bg.png"
            alt="Grab Logo"
            className="h-24 w-auto object-contain"
          />
        </div>

        {/* Search Input */}
        <div className="mb-8 text-left">
          <label htmlFor="search" className="block text-xl font-medium text-primary mb-3">
            What do you want to buy?
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              placeholder="Ex: I want to buy 1kg apples and 2kg oranges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <QuestionMarkCircleIcon  className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Distance input */}
        <div className="mb-8 text-left">
          <label htmlFor="distance" className="block text-xl font-medium text-primary mb-3">
            Maximum distance you can manage to travel (km)
          </label>
          <div className="relative">
            <input
              type="text"
              id="distance"
              disabled
              className="w-full p-4 pl-14 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              value={distance + " km"}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
            <MapPinIcon className="h-10 w-10 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Distance Slider */}
        <div className="mb-8 text-left">
          <div className="relative mt-6">
            <input
              type="range"
              min="1"
              max="50"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B14F]"
            />
            <div className="flex justify-between text-base text-gray-500 mt-2">
              <span>1km</span>
              <span>50km</span>
            </div>
          </div>
        </div>
    
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#00B14F] text-white py-4 rounded-lg text-lg font-medium hover:bg-[#009F47] transition-colors"
        >
          Find me stores
        </button>
      </div>
    </div>
  );
};

export default SearchForm; 