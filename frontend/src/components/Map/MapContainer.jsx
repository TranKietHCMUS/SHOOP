import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';
import toast from 'react-hot-toast';


const MapContainer = ({ 
  stores = [], 
  radius = 1000, 
}) => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [storeMarkers, setStoreMarkers] = useState([]);
  const [circle, setCircle] = useState(null);
  const { isLoaded, error, googleApi } = useGoogleMapsApi();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          toast.error('Cannot get your location', {
            position: 'top-center',
            duration: 3000,
            style: {
              background: 'red',
              color: '#fff',
            },
          });
          setUserLocation({ lat: 10.762622, lng: 106.660172 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isLoaded && googleApi && mapRef.current && userLocation) {
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

      // Khởi tạo map instance
      const map = new googleApi.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Tạo marker cho user
      const newUserMarker = new googleApi.maps.Marker({
        position: userLocation,
        map,
        title: 'Vị trí của bạn',
        icon: userMarkerIcon
      });
      setUserMarker(newUserMarker);

      // Tạo circle cho bán kính
      const newCircle = new googleApi.maps.Circle({
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#4285F4',
        fillOpacity: 0.1,
        map,
        center: userLocation,
        radius: radius
      });
      setCircle(newCircle);

      // Tạo marker cho các cửa hàng
      const newStoreMarkers = stores.map(store => {
        const marker = new googleApi.maps.Marker({
          position: store.coordinates,
          map,
          title: store.name,
          icon: storeMarkerIcon
        });

        // Thêm info window cho mỗi cửa hàng
        const infoWindow = new googleApi.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold">${store.name}</h3>
              <p class="text-sm">${store.address}</p>
              <p class="text-sm mt-1"><strong>Sản phẩm:</strong></p>
              <ul class="text-sm list-disc list-inside">
                ${store.products.map(product => `<li>${product}</li>`).join('')}
              </ul>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        return marker;
      });
      setStoreMarkers(newStoreMarkers);
    }

    // Cleanup function
    return () => {
      if (userMarker) userMarker.setMap(null);
      if (circle) circle.setMap(null);
      storeMarkers.forEach(marker => marker.setMap(null));
    };
  }, [isLoaded, googleApi, userLocation, stores, radius]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <p className="text-red-500">Có lỗi khi tải Google Maps: {error.message}</p>
      </div>
    );
  }

  if (!isLoaded || !userLocation) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">Đang tải bản đồ...</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef}
      className="w-full h-[400px] rounded-lg shadow-lg"
    />
  );
};

export default MapContainer; 