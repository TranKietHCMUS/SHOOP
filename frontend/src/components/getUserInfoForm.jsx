import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionMarkCircleIcon, MapPinIcon } from "@heroicons/react/24/solid";
import toast, { Toaster } from 'react-hot-toast';

const SearchForm = () => {
  const navigate = useNavigate();
  const [distance, setDistance] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter your search content', {
        duration: 1500,
        position: 'top-center',
        style: {
          background: '#ffea94',
          color: '#000',
          fontWeight: 'bold',
        },
        icon: '❗',
      });
      return;
    }
    const searchData = {
      prompt: searchQuery,
      expected_radius: distance
    };
    navigate('/result', { state: { searchData } });
  };

  return (
    <div className="w-full">
      <Toaster />
      <div className="bg-white rounded-lg px-2">
        {/* Logo */}
        <div className="mb-3 flex justify-center">
          <img 
            src="/logo/no_bg_new.png"
            alt="Grab Logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Search Input */}
        <div className="mb-3 text-left">
          <label htmlFor="search" className="block text-sm font-medium text-primary mb-1">
            What do you want to buy?
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              className="w-full p-2 pl-9 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              placeholder="Ex: 1kg apple and 2kg orange..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <QuestionMarkCircleIcon className="h-5 w-5 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Distance input */}
        <div className="mb-2 text-left">
          <label htmlFor="distance" className="block text-sm font-medium text-primary mb-1">
            Maximum distance (km)
          </label>
          <div className="relative">
            <input
              type="text"
              id="distance"
              disabled
              className="w-full p-2 pl-9 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              value={distance + " km"}
            />
            <MapPinIcon className="h-5 w-5 text-primary absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Distance Slider */}
        <div className="mb-3 text-left">
          <div className="relative mt-2">
            <input
              type="range"
              min="1"
              max="50"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B14F]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1km</span>
              <span>50km</span>
            </div>
          </div>
        </div>
    
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#00B14F] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#009F47] transition-colors"
        >
          Search Store
        </button>
      </div>
    </div>
  );
};

export default SearchForm;