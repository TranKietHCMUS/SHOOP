import React from 'react';
import MapContainer from './MapContainer';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';

const MapSection = ({ 
  currentPhase,
  onStoreClick,
  routes = [],
  onRouteClick
}) => {
  const renderRoutes = (map, googleApi, routes) => {
    return routes.map((route, index) => {
      const path = new googleApi.maps.Polyline({
        path: {
          lat: route.lat,
          lng: route.lng
        },
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      path.setMap(map);

      // Thêm click event cho route
      path.addListener('click', () => {
        onRouteClick(route);
      });

      return path;
    });
  };

  return (
    <MapContainer
      onStoreClick={onStoreClick}
      renderAdditionalLayers={currentPhase === 2 ? renderRoutes : null}
      routes={routes}
    />
  );
};

export default MapSection; 