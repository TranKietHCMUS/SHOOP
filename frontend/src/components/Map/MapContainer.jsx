import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';
import toast from 'react-hot-toast';
import { mapColors } from '../../lib/map_colors';

const MapContainer = ({ 
  userLocation,
  stores = [], 
  radius = 1000,
  onStoreClick,
  renderAdditionalLayers = null,
  routes = [],
}) => {
  console.log('MapContainer props:', { stores, routes, userLocation });
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const watchIdRef = useRef(null);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const additionalLayersRef = useRef([]);
  const isInitializedRef = useRef(false);
  const { isLoaded, error, googleApi } = useGoogleMapsApi();
  // Store zoom level in ref instead of state to prevent re-renders
  const mapZoomRef = useRef(window.innerWidth < 768 ? 13 : 14);

  const cleanupMap = useCallback(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    // Xóa circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    // Xóa store markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }

    // Xóa additional layers
    if (additionalLayersRef.current.length > 0) {
      additionalLayersRef.current.forEach(layer => {
        if (layer && typeof layer.setMap === 'function') {
          layer.setMap(null);
        }
      });
      additionalLayersRef.current = [];
    }

    // Clear location watch
    // if (watchIdRef.current) {
    //   navigator.geolocation.clearWatch(watchIdRef.current);
    //   watchIdRef.current = null;
    // }
  }, []);

  // const updateUserLocation = (position) => {
  //   const newLocation = {
  //     lat: position.coords.latitude,
  //     lng: position.coords.longitude
  //   };
  //   setCurrentUserLocation(newLocation);
    
  //   if (userMarkerRef.current) {
  //     userMarkerRef.current.setPosition(newLocation);
  //   }
  //   if (circleRef.current) {
  //     circleRef.current.setCenter(newLocation);
  //   }
  //   if (mapInstanceRef.current) {
  //     mapInstanceRef.current.panTo(newLocation);
  //   }
  // };

  // const handleLocationError = (error) => {
  //   console.error('Geolocation error:', error);
  //   toast.error('Cannot get your location: ' + error.message, {
  //     position: 'top-center',
  //     duration: 3000,
  //     style: {
  //       background: 'red',
  //       color: '#fff',
  //     },
  //   });
  // };

  // const startTracking = () => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         updateUserLocation(position);
  //         toast.success('Your location has been updated!', {
  //           position: 'top-center',
  //           duration: 3000,
  //         });

  //         watchIdRef.current = navigator.geolocation.watchPosition(
  //           updateUserLocation,
  //           handleLocationError,
  //           {
  //             enableHighAccuracy: true,
  //             timeout: 5000,
  //             maximumAge: 0
  //           }
  //         );
  //       },
  //       handleLocationError,
  //       {
  //         enableHighAccuracy: true,
  //         timeout: 5000,
  //         maximumAge: 0
  //       }
  //     );
  //   } else {
  //     toast.error('Your browser does not support Geolocation', {
  //       position: 'top-center',
  //       duration: 3000,
  //     });
  //   }
  // };

  // Khởi tạo vị trí user khi component mount
  useEffect(() => {
    if (isLoaded && googleApi && mapRef.current && userLocation) {
      // Cleanup trước khi tạo map mới
      cleanupMap();
      const userMarkerUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 384 512">
            <path fill="#fa0202" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
          </svg>
        `)

      const userMarkerIcon = {
        url: userMarkerUrl,
        size: new googleApi.maps.Size(32, 32),
        origin: new googleApi.maps.Point(0, 0),
        anchor: new googleApi.maps.Point(16, 32),
        scaledSize: new googleApi.maps.Size(32, 32)
      };

      // Tạo map instance mới
      const newMap = new googleApi.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: mapZoomRef.current,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });
      mapInstanceRef.current = newMap;

      // Tạo user marker mới
      const newUserMarker = new googleApi.maps.Marker({
        position: userLocation,
        map: newMap,
        title: 'Your location',
        icon: userMarkerIcon
      });
      userMarkerRef.current = newUserMarker;

      // Tạo circle mới
      const newCircle = new googleApi.maps.Circle({
        strokeColor: '#00B14F',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00B14F',
        fillOpacity: 0.1,
        map: newMap,
        center: userLocation,
        radius: radius
      });
      circleRef.current = newCircle;

      markersRef.current = stores.map(store => {
        const storeColor = mapColors[store.name] || '#00B14F'; // Default to green if no color found
        
        // Regular marker SVG
        const markerSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 384 512">
            <path fill="${storeColor}" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
          </svg>
        `;

        // Hover/active marker SVG (larger with shadow effect)
        const hoverMarkerSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 384 512" style="filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.4));">
            <path fill="${storeColor}" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
          </svg>
        `;

        const normalIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
          scaledSize: new googleApi.maps.Size(32, 32),
          origin: new googleApi.maps.Point(0, 0),
          anchor: new googleApi.maps.Point(16, 32) // Anchor at the bottom tip of the pin
        };

        const hoverIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(hoverMarkerSvg),
          scaledSize: new googleApi.maps.Size(40, 40),
          origin: new googleApi.maps.Point(0, 0),
          anchor: new googleApi.maps.Point(20, 40) // Anchor at the bottom tip of the pin
        };

        const marker = new googleApi.maps.Marker({
          position: {
            lat: parseFloat(store.lat),
            lng: parseFloat(store.lng)
          },
          map: newMap,
          title: store.name,
          icon: normalIcon,
          animation: null,
          optimized: false // This helps with animations being smoother
        });

        // Add hover effect
        marker.addListener('mouseover', () => {
          marker.setIcon(hoverIcon);
          marker.setZIndex(1000); // Bring to front
          
          if (!marker.getAnimation()) {
            marker.setAnimation(googleApi.maps.Animation.BOUNCE);
            setTimeout(() => {
              marker.setAnimation(null);
            }, 200);
          }
        });

        marker.addListener('mouseout', () => {
          marker.setIcon(normalIcon);
          marker.setZIndex(null); // Reset z-index
        });

        // Add click handler to show sidebar with store info
        marker.addListener('click', () => {
          // Temporarily set to hover icon to maintain visual feedback
          marker.setIcon(hoverIcon);
          marker.setZIndex(1000);
          
          // Add bounce animation
          if (!marker.getAnimation()) {
            marker.setAnimation(googleApi.maps.Animation.BOUNCE);
            // Stop bouncing after 2 bounces
            setTimeout(() => {
              marker.setAnimation(null);
              // Don't reset the icon - keep it highlighted
            }, 750);
          }
          
          if (onStoreClick) {
            onStoreClick(store);
          }
          
          // Reset to normal icon after some delay
          setTimeout(() => {
            marker.setIcon(normalIcon);
            marker.setZIndex(null);
          }, 3000);
        });

        return marker;
      });

      if (renderAdditionalLayers && routes.length > 0) {
        additionalLayersRef.current = renderAdditionalLayers(newMap, googleApi, routes);
      }
    } else if (isLoaded && !userLocation) {
      console.warn("MapContainer: Waiting for userLocation prop...");
      cleanupMap();
  }
    return () => {
      cleanupMap();
    };
  }, [isLoaded, googleApi, userLocation, stores, radius, renderAdditionalLayers, routes, onStoreClick, cleanupMap]);

  useEffect(() => {
    const handleResize = () => {
      const newZoom = window.innerWidth < 768 ? 13 : 14;
      mapZoomRef.current = newZoom;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setZoom(newZoom);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <p className="text-red-500">Error when loading maps: {error.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }
  if (isLoaded && !userLocation) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">Getting your location...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div 
        ref={mapRef}
        className="w-full h-full rounded-lg shadow-lg"
      />
    </div>
  );
};

export default MapContainer;