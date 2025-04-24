import { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Biến global để track trạng thái loading của API
let isLoading = false;
let isLoaded = false;
let googleApi = null;

// Hàm tải Google Maps API theo best practice
const loadGoogleMapsApi = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(window.google);
      return;
    }

    // Callback khi API được tải xong
    window.initMap = () => {
      resolve(window.google);
    };

    // Tạo script tag với callback
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap&loading=async`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      reject(new Error('Không thể tải Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

export function useGoogleMapsApi() {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Nếu API đã load xong, return luôn
    if (isLoaded) {
      return;
    }

    // Nếu đang loading, không làm gì cả
    if (isLoading) {
      return;
    }

    // Bắt đầu process loading
    isLoading = true;

    loadGoogleMapsApi()
      .then((google) => {
        isLoaded = true;
        isLoading = false;
        googleApi = google;
      })
      .catch((err) => {
        isLoading = false;
        setError(err);
      });

    // Cleanup function
    return () => {
      if (!isLoaded) {
        const script = document.querySelector('script[src*="maps.googleapis.com"]');
        if (script) {
          document.head.removeChild(script);
        }
        isLoading = false;
        delete window.initMap;
      }
    };
  }, []);

  return { isLoaded, error, googleApi };
} 