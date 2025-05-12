import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionMarkCircleIcon, MapPinIcon } from "@heroicons/react/24/solid";
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const SearchForm = () => {
  const navigate = useNavigate();
  const [distance, setDistance] = useState(5);
  const [distanceInput, setDistanceInput] = useState('5'); // Add this new state for input display
  const [searchQuery, setSearchQuery] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [customAddress, setCustomAddress] = useState('');

  const handleDistanceChange = (e) => {
    const value = e.target.value;
    setDistanceInput(value);
    
    // Only update the actual distance state if there's a value
    if (value === '') {
      setDistance(''); // Allow empty string in the state
    } else {
      setDistance(Number(value));
    }
  };

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
    
    const finalDistance = distance === '' ? 5 : distance;
    
    const searchData = {
      prompt: searchQuery,
      expected_radius: finalDistance,
      location: useCurrentLocation ? 'current' : customAddress
    };
    navigate('/result', { state: { searchData } });
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        exit={{ opacity: 0, y: -100 }}
        className="mb-2 sm:mb-3 text-center text-lg text-primary"
      >
      <Toaster />
      <div className="bg-white rounded-lg px-2 sm:px-3 md:px-3">
        {/* Logo */}
        <div className="mb-2 flex justify-center">
          <img 
            src="/logo/no_bg_new.png"
            alt="Grab Logo"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
        </div>

        {/* Search Input - Changed to textarea */}
        <div className="mb-2 text-left">
          <label htmlFor="search" className="block text-xs sm:text-sm font-medium text-primary mb-1">
            What do you want to buy?
          </label>
          <div className="relative">
            <textarea
              id="search"
              className="w-full p-1.5 pl-7 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              placeholder="Ex: 1kg apple and 2kg orange for a total of 200000 vnd..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rows={useCurrentLocation ? "4" : "3"}
            />
            <QuestionMarkCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary absolute left-1.5 top-3 transform" />
          </div>
        </div>

        {/* Distance input - Changed to number input */}
        <div className="mb-2 text-left">
          <label htmlFor="distance" className="block text-xs sm:text-sm font-medium text-primary mb-1">
            Maximum distance or radius (km)
          </label>
          <div className="relative">
            <input
              type="number"
              id="distance"
              min="0.1"
              max="50"
              className="w-full p-1.5 pl-7 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
              value={distanceInput} 
              onChange={handleDistanceChange}
            />
            <MapPinIcon className="h-4 w-4 text-primary absolute left-1.5 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Location Selection - New input */}
        <div className="mb-2 text-left">
          <label className="block text-xs sm:text-sm font-medium text-primary mb-1">
            Your location
          </label>
          <div className="flex items-center mb-1">
            <input
              type="radio"
              id="currentLocation"
              name="locationType"
              checked={useCurrentLocation}
              onChange={() => setUseCurrentLocation(true)}
              className="mr-2 accent-[#00B14F]"
            />
            <label htmlFor="currentLocation" className="text-xs sm:text-sm">Use current location</label>
          </div>
          <div className="flex items-center mb-1">
            <input
              type="radio"
              id="customLocation"
              name="locationType"
              checked={!useCurrentLocation}
              onChange={() => setUseCurrentLocation(false)}
              className="mr-2 accent-[#00B14F]"
            />
            <label htmlFor="customLocation" className="text-xs sm:text-sm">Enter custom address</label>
          </div>
          
          {!useCurrentLocation && (
            <div className="relative mt-1">
              <input
                type="text"
                id="address"
                className="w-full p-1.5 pl-7 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent textfield-bg-primary text-left"
                placeholder="Enter your address..."
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
              />
              <MapPinIcon className="h-4 w-4 text-primary absolute left-1.5 top-1/2 transform -translate-y-1/2" />
            </div>
          )}
        </div>
    
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#00B14F] text-white py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#009F47] transition-colors"
        >
          Search Store
        </button>
      </div>
      </motion.div>
    </div>
  );
};

export default SearchForm;