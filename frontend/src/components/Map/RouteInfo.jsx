import React from 'react';

const RouteInfo = ({ route }) => {
  if (!route) {
    return (
      <div className="p-4 text-center text-gray-500">
        Choose a route to see details
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-bold text-lg">Route information</h3>
      <div className="mt-4">
        <p className="text-gray-600">Start point: {route.start}</p>
        <p className="text-gray-600">End point: {route.end}</p>
        <p className="text-gray-600">Distance: {route.distance}km</p>
        <p className="text-gray-600">Estimated time: {route.duration} minutes</p>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold">Route:</h4>
        <ul className="list-decimal list-inside mt-2">
          {route.waypoints?.map((point, index) => (
            <li key={index} className="text-gray-700">{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RouteInfo;
