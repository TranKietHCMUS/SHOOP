import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, DollarSign, ChevronDown, ChevronUp, Map } from 'lucide-react';
import CustomScrollbar from '../SubComponents/Scrollbar';

export default function RouteInfo({ route }) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  if (!route) {
    return (
      <div className="p-4 text-center text-gray-500">
        Choose a route to see details
      </div>
  );
  }
  // console.log("ROUTE in card: ", route);
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };
  
  // Format cost to VND currency
  const formatCost = (cost) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(cost);
  };
  
  // Truncate long addresses
  const truncateAddress = (address, maxLength = 60) => {
    if (!address) return '';
    if (typeof address !== 'string') return address;
    if (address.length <= maxLength) return address;
    return `${address.substring(0, maxLength)}...`;
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-primary text-white p-3 sm:p-4 flex justify-between items-center">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Navigation size={16} className="sm:w-5 sm:h-5" />
          <span className="font-bold text-sm sm:text-base">Route #{route.id}</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1">
            <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-sm sm:text-base">{formatDuration(route.duration)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm sm:text-base">{formatCost(route.cost)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 min-h-0">
        {/* Origin and Destination */}
        <div className="flex items-start mb-4">
          <div className="mr-2 sm:mr-3 flex flex-col items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
              <MapPin size={14} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="w-1 h-8 sm:h-10 bg-gray-300"></div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              <MapPin size={14} className="sm:w-[18px] sm:h-[18px]" />
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2">
              <p className="text-xs sm:text-sm text-gray-500">Start</p>
              <p title={route.waypoints[0]} className="text-xs sm:font-medium sm:text-sm">{truncateAddress(route.waypoints[0], isMobile ? 30 : 60)}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">End</p>
              <p title={route.waypoints[route.waypoints.length - 1]} className="text-xs sm:font-medium sm:text-sm">{truncateAddress(route.waypoints[route.waypoints.length - 1], isMobile ? 30 : 60)}</p>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded-md mb-3">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500">Distance</p>
            <p className="text-xs sm:text-sm sm:font-medium">{route.distance} km</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500">Duration</p>
            <p className="text-xs sm:text-sm sm:font-medium">{formatDuration(route.duration)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500">Cost</p>
            <p className="text-xs sm:text-sm sm:font-medium">{formatCost(route.cost)}</p>
          </div>
        </div>

        {/* Waypoints - Expanded View */}
        {route.waypoints && route.waypoints.length > 0 && (
          <div className="flex flex-col flex-1 min-h-0">
            <button 
              className="flex items-center justify-between w-full text-left text-xs sm:text-sm font-medium text-primary hover:text-blue-800 py-2"
              onClick={() => setExpanded(!expanded)}
            >
              <span>Waypoints ({route.waypoints.length})</span>
              {expanded ? <ChevronUp size={14} className="sm:w-4 sm:h-4" /> : <ChevronDown size={14} className="sm:w-4 sm:h-4" />}
            </button>
            {expanded && (
            <CustomScrollbar>
                {route.waypoints.map((waypoint, index) => (
                  <div key={index} className="py-1 sm:py-2">
                    <div className="flex">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center text-white mr-2 self-start mt-1">
                        <span className="text-xs">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs sm:text-sm break-words">{truncateAddress(waypoint, isMobile ? 30 : 60)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CustomScrollbar>
            )}
          </div>
        )}
      </div>
    </div>
  );
}