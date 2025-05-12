import React from 'react';
import MapContainer from './MapContainer';

const MapSection = React.memo(({ 
  stores, 
  onStoreClick, 
  renderAdditionalLayers, 
  routes,
  radius,
  userLocation 
}) => {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        stores={stores}
        radius={radius}
        onStoreClick={onStoreClick}
        renderAdditionalLayers={renderAdditionalLayers}
        routes={routes}
        userLocation={userLocation}
      />
    </div>
  );
});

MapSection.displayName = 'MapSection';

export default MapSection; 