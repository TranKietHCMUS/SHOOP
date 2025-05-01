import { useState } from 'react';
import { MapPin, Navigation, Clock, DollarSign, ChevronDown, ChevronUp, Map } from 'lucide-react';

export default function RouteInfo({ route }) {
  const [expanded, setExpanded] = useState(false);
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
    if (address.length <= maxLength) return address;
    return `${address.substring(0, maxLength)}...`;
  };

  return (
    <div className="bg-white overflow-hidden border max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Navigation size={20} />
          <span className="font-bold">Route #{route.id}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock size={18} />
            <span>{formatDuration(route.duration)}</span>
          </div>
          <div className="flex items-center space-x-1">
            {/* <DollarSign size={18} /> */}
            <span>{formatCost(route.cost)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Origin and Destination */}
        <div className="flex items-start mb-4">
          <div className="mr-3 flex flex-col items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
              <MapPin size={18} />
            </div>
            <div className="w-1 h-10 bg-gray-300"></div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              <MapPin size={18} />
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2">
              <p className="text-sm text-gray-500">Start</p>
              <p className="font-medium">{truncateAddress(route.start)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End</p>
              <p className="font-medium">{truncateAddress(route.end)}</p>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md mb-3">
          <div className="text-center">
            <p className="text-sm text-gray-500">Distance</p>
            <p className="font-medium">{route.distance} km</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{formatDuration(route.duration)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Cost</p>
            <p className="font-medium">{formatCost(route.cost)}</p>
          </div>
        </div>

        {/* Waypoints - Expanded View */}
        {route.waypoints && route.waypoints.length > 0 && (
          <div>
            <button 
              className="flex items-center justify-between w-full text-left text-sm font-medium text-primary hover:text-blue-800 py-2"
              onClick={() => setExpanded(!expanded)}
            >
              <span>Waypoints ({route.waypoints.length})</span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expanded && (
              <div className="mt-2 pl-4 border-l-2 border-green-500">
                {route.waypoints.map((waypoint, index) => (
                  <div key={index} className="py-2">
                    <div className="flex">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white mr-2 self-start mt-1">
                        <span className="text-xs">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm break-words">{waypoint}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Map Button */}
        {/* <button className="mt-4 flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition duration-150">
          <Map size={18} className="mr-2" />
          View on Map
        </button> */}
      </div>
    </div>
  );
}