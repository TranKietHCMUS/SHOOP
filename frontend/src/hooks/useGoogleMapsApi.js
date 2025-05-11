import { useState, useEffect } from 'react';
import { API_CONFIG } from '../lib/config';

export function useGoogleMapsApi() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [googleApi, setGoogleApi] = useState(null);
  const GOOGLE_MAPS_API_KEY = API_CONFIG.GOOGLE_MAPS_API_KEY;
  useEffect(() => {
    let isMounted = true;

    const loadGoogleMapsApi = () => {
      return new Promise((resolve, reject) => {
        // Nếu API đã được load trước đó
        if (window.google) {
          resolve(window.google);
          return;
        }

        // Tạo một ID duy nhất cho callback function
        const callbackName = 'googleMapsCallback_' + Math.random().toString(36).substr(2, 9);
        window[callbackName] = () => {
          if (isMounted) {
            resolve(window.google);
          }
          delete window[callbackName];
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
          if (isMounted) {
            reject(new Error('Không thể tải Google Maps API'));
          }
        };

        document.head.appendChild(script);
      });
    };

    loadGoogleMapsApi()
      .then((google) => {
        if (isMounted) {
          setIsLoaded(true);
          setGoogleApi(google);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
        }
      });

    return () => {
      isMounted = false;
      // Xóa script tag nếu nó tồn tại
      const script = document.querySelector('script[src*="maps.googleapis.com"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return { isLoaded, error, googleApi };
} 