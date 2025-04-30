import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';
import toast from 'react-hot-toast';

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

  // Cleanup function để xóa tất cả markers và shapes
  const cleanupMap = () => {
    // Xóa user marker
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
  };

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
  // useEffect(() => {
  //   if (!isInitializedRef.current && isLoaded) {
  //     startTracking();
  //     isInitializedRef.current = true;
  //   }
  //   // Cleanup khi component unmount
  //   return () => {
  //     if (watchIdRef.current) {
  //       navigator.geolocation.clearWatch(watchIdRef.current);
  //       watchIdRef.current = null;
  //     }
  //   };
  // }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && googleApi && mapRef.current && userLocation) {
      // Cleanup trước khi tạo map mới
      cleanupMap();

      const storeMarkerIcon = {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        size: new googleApi.maps.Size(32, 32),
        origin: new googleApi.maps.Point(0, 0),
        anchor: new googleApi.maps.Point(16, 32),
        scaledSize: new googleApi.maps.Size(32, 32)
      };

      const userMarkerIcon = {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        size: new googleApi.maps.Size(32, 32),
        origin: new googleApi.maps.Point(0, 0),
        anchor: new googleApi.maps.Point(16, 32),
        scaledSize: new googleApi.maps.Size(32, 32)
      };

      // Tạo map instance mới
      const newMap = new googleApi.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 14,
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

      // Tạo store markers mới
      markersRef.current = stores.map(store => {
        const marker = new googleApi.maps.Marker({
          position: {
            lat: parseFloat(store.lat),
            lng: parseFloat(store.lng)
          },
          map: newMap,
          title: store.name,
          icon: storeMarkerIcon
        });

        marker.addListener('click', () => {
          if (onStoreClick) {
            onStoreClick(store);
          }
        });

        return marker;
      });

      // Render additional layers nếu có
      if (renderAdditionalLayers && routes.length > 0) {
        additionalLayersRef.current = renderAdditionalLayers(newMap, googleApi, routes);
      }
    } else if (isLoaded && !userLocation) {
      // Trường hợp API đã load nhưng chưa có userLocation (đang chờ hoặc lỗi)
      // Có thể hiển thị một thông báo chờ trên map div
      console.warn("MapContainer: Waiting for userLocation prop...");
      // Đảm bảo map cũ được dọn dẹp nếu có
      cleanupMap();
  }
    return () => {
      cleanupMap();
    };
  }, [isLoaded, googleApi, userLocation, stores, radius, renderAdditionalLayers, routes, onStoreClick]);

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