import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import MapContainer from '../components/Map/MapContainer';
import SideBar from '../components/Map/SideBar';
import ProcessingRequest from '../components/ProcessingRequest';
import { Toaster, toast } from 'react-hot-toast';
import Header from '../components/Header';
import { mapColors } from '../lib/map_colors';
import { useNavigate } from 'react-router-dom';
import { useGoogleMapsApi } from '../hooks/useGoogleMapsApi'; // Import the Google Maps API hook
import { API_CONFIG } from '../lib/config';
const MapSection = React.memo(({ 
  stores, 
  onStoreClick, 
  renderAdditionalLayers, 
  routes,
  radius,
  userLocation 
}) => {
  return (
    <div className="absolute inset-0">
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

const MainPage = () => {
  const location = useLocation();
  const searchData = location.state?.searchData;
  const [searchResults, setSearchResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const routePolylinesRef = useRef([]);
  const { isLoaded, error, googleApi } = useGoogleMapsApi(); // Use the Google Maps API hook
  const routeColorsRef = useRef({});
  // Thêm ref để theo dõi mặc dù lưu trữ màu ban đầu của route
  const originalRouteColorsRef = useRef({});

  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState('store');
  const [routes, setRoutes] = useState([]);
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const processSearchWithLocation = useCallback(async () => {
    if (!searchData) {
      toast.error('No search data found');
      setIsProcessing(false);
      return;
    }

    console.log('Starting search process...');
    let fetchedLocation = null;
    try {
      if (searchData.location !== 'current') {
        console.log('Using custom address:', searchData.location);
        
        // Check if Google Maps API is loaded through our hook
        if (!isLoaded || !googleApi) {
          throw new Error('Google Maps API not loaded');
        }
        
        const geocoder = new googleApi.maps.Geocoder();
        
        fetchedLocation = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: searchData.location }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              const location = results[0].geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng()
              });
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
        
        setUserLocation(fetchedLocation);
      }
      else {
        console.log('Getting user location...');
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Your browser does not provided with geolocation.'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        });

        fetchedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(fetchedLocation);
      }
      // Bước 2: Gọi API với vị trí đã lấy được
      console.log('Calling API with:', { searchData, user_location: fetchedLocation });
      setIsProcessing(true);
      const response = await fetch(`/api/search/nearby`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...searchData,
          user_location: fetchedLocation
        })
      })
      
      if (!response.ok) {
        throw new Error('Error in API call');
      }

      const data = await response.json();
      setUserLocation({
        lat: data.user_loc[0],
        lng: data.user_loc[1]
      })
      setSearchResults(data.stores)
      setIsProcessing(false);
      if (data.stores.length > 0) {
        toast.success('We found these stores near your place!!');
      } else {
        toast.error('No stores found near your place. Please try again with a different location or prompt.');
      }
    } catch (error) {
      console.error('Error during searching: ', error);
      if (!fetchedLocation) { 
         toast.error(`Navigator error: ${error.message}`);
      } else {
         toast.error(`Searching error: ${error.message}`);
      }
      if (!fetchedLocation) setUserLocation(null);
    } finally {
      setIsProcessing(false);
    }
  }, [searchData, isLoaded, googleApi]);

  useEffect(() => {
    setIsProcessing(true);
    if (isLoaded) {
      processSearchWithLocation();
    }
  }, [processSearchWithLocation, isLoaded]);

  const handleStoreClick = useCallback((store) => {
    setSelectedStore(store);
    setIsSidebarCollapsed(false); // Ensure sidebar expands when a store is clicked
    if (currentPhase === 2) {
      setActiveTab('store');
    }
  }, [currentPhase]);

  const handleRouteClick = useCallback((route) => {
    setSelectedRoute(route);
    setActiveTab('route');
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleNextPhase = useCallback(async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/search/plans`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stores: searchResults,
          user_loc: [userLocation.lat, userLocation.lng]
        })
      })
      
      if (!response.ok) {
        throw new Error('Error in API call');
      }
      const data = await response.json();
      setRoutes(data);
      setCurrentPhase(2);
      setSelectedStore(null);
      setActiveTab('route');
      setIsProcessing(false);
      if (data[0]._error_message) {
        toast.error(data[0]._error_message, {
          duration: 3000,
          position: 'top-center',
        });
      }
      else {
        toast.success('Found routes!', {
          duration: 3000,
          position: 'top-center',
        });
      }
    } catch (error) {
      toast.error(`An error: "${error}" occurred while finding routes. Please try again!`, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: 'red',
          color: '#fff',
        },
      });
    } finally {
      setIsProcessing(false);
    }
  }, [userLocation, searchResults]);

  const handleBackPhase = useCallback(() => {
    setCurrentPhase(1);
    setSelectedRoute(null);
    setRoutes([]);
    setActiveTab('store');
    setSelectedStore(null);
  }, []);

  // Memoize renderRoutes function
  const renderRoutes = useCallback((map, googleApi, routesToRender) => {
    // Don't proceed if map or googleApi isn't available
    if (!map || !googleApi) {
      return [];
    }
    
    const directionsService = new googleApi.maps.DirectionsService();
    const renderedRoutes = [];
  
    if (map) {
      if (routePolylinesRef.current && routePolylinesRef.current.length > 0) {
        routePolylinesRef.current.forEach(routeData => {
          if (routeData.path) {
            routeData.path.setMap(null);
          }
          if (routeData.listener) {
            googleApi.maps.event.removeListener(routeData.listener);
          }
        });
        routePolylinesRef.current = [];
      }
    }
  
    const routeColors = [
      '#FF4500',
      '#4285F4', 
      '#9C27B0'
    ];
    
    routesToRender.forEach((route, index) => {
      if (!originalRouteColorsRef.current[route.id]) {
        const colorIndex = index % routeColors.length;
        const routeColor = routeColors[colorIndex];
        originalRouteColorsRef.current[route.id] = routeColor;
      }
    });
  
    routesToRender.forEach((route, index) => {
      if (!route || !Array.isArray(route.coordinates) || route.coordinates.length < 2) {
        console.log("Invalid route:", route);
        return;
      }
  
      const origin = route.coordinates[0];
      const destination = route.coordinates[route.coordinates.length - 1];
      const waypoints = route.waypoints
      .slice(1) 
      .map(address => ({
        location: address,
        stopover: true,
      }));     
      
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          optimizeWaypoints: true,
          travelMode: googleApi.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === googleApi.maps.DirectionsStatus.OK && result.routes.length > 0) {
            const isSelected = selectedRoute && selectedRoute.id === route.id;
            
            const originalColor = originalRouteColorsRef.current[route.id];
            
            const strokeColor = isSelected ? '#00B14F' : originalColor;

            const zIndex = isSelected ? 1000 : 900 - index;
            const strokeWeight = isSelected ? 10 : 6;
            
            const pathCoordinates = result.routes[0].overview_path;
  
            const path = new googleApi.maps.Polyline({
              path: pathCoordinates,
              geodesic: true,
              strokeColor,
              strokeOpacity: 0.7,
              strokeWeight,
              zIndex,
              map,
              clickable: true
            });
            
            const hoverWeight = isSelected ? 12 : 9;
            
            googleApi.maps.event.addListener(path, 'mouseover', () => {
              path.setOptions({
                strokeWeight: hoverWeight,
                strokeOpacity: 0.9,
                zIndex: 1001 
              });
            });
            
            googleApi.maps.event.addListener(path, 'mouseout', () => {
              path.setOptions({
                strokeWeight,
                strokeOpacity: 0.7,
                zIndex: isSelected ? 1000 : 900 - index
              });
            });
  
            const listener = googleApi.maps.event.addListener(path, 'click', () => {              
              path.setOptions({
                strokeWeight: hoverWeight,
                strokeOpacity: 1,
                zIndex: 1001
              });
              
              setTimeout(() => {
                if (path) {
                  path.setOptions({
                    strokeWeight: isSelected ? 12 : 10,
                    strokeOpacity: 0.9
                  });
                }
              }, 300);
              
              handleRouteClick(route);
              setIsSidebarCollapsed(false); 
            });
  
            renderedRoutes.push({ path, listener });
            routePolylinesRef.current.push({ path, listener });
          } else {
            console.warn('Directions request failed:', status);
          }
        }
      );
    });
  
    return renderedRoutes;
  }, [handleRouteClick, selectedRoute]);
  
  useEffect(() => {
    return () => {
      if (routePolylinesRef.current && routePolylinesRef.current.length > 0) {
        routePolylinesRef.current.forEach(routeData => {
          if (routeData.path) {
            routeData.path.setMap(null);
          }
          if (routeData.listener && window.google) {
            window.google.maps.event.removeListener(routeData.listener);
          }
        });
        routePolylinesRef.current = [];
      }
    };
  }, []);
  

  const sidebarProps = useMemo(() => ({
    currentPhase,
    selectedStore,
    selectedRoute,
    activeTab,
    onTabChange: handleTabChange,
    searchResults: searchResults || [], // Truyền stores từ searchResults
    routes, // Truyền routes đã tìm được (hoặc mock)
    isLoadingRoutes: isProcessing && currentPhase === 1, // Cờ báo đang tìm routes
    isLoadingSearch: isProcessing && userLocation === null, // Cờ báo đang tìm kiếm ban đầu
    onFindRoutes: handleNextPhase, // Truyền hàm tìm route
    onBack: handleBackPhase, // Truyền hàm quay lại
    isCollapsed: isSidebarCollapsed, // Pass the collapsed state to sidebar
    setIsCollapsed: setIsSidebarCollapsed // Pass the function to toggle sidebar
  }), [currentPhase, selectedStore, selectedRoute, activeTab, handleTabChange, searchResults, routes, isProcessing, userLocation, handleNextPhase, handleBackPhase, isSidebarCollapsed]);


  // Memoize map section props
  const mapSectionProps = useMemo(() => {
    // Chỉ truyền stores từ kết quả tìm kiếm API
     const storesToShow = searchResults || [];
    return {
      stores: storesToShow, // Sử dụng stores từ API
      radius: searchData?.expected_radius ? parseFloat(searchData.expected_radius) * 1000 : 1000, 
      onStoreClick: handleStoreClick,
      renderAdditionalLayers: currentPhase === 2 ? (map, google) => renderRoutes(map, google, routes) : null, // Truyền hàm render với routes hiện tại
      routes: routes, // Truyền routes để MapContainer biết khi nào cần vẽ lại
      userLocation // Truyền userLocation đã lấy được
    };
  }, [searchResults, handleStoreClick, currentPhase, renderRoutes, routes, userLocation, searchData?.expected_radius]);

  if (isProcessing && userLocation === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your request...</p>
        </div>
      </div>
    );
  }
  if (!isProcessing && !userLocation) {
    return (
      <>
        <Toaster />
        <Header />
        <div className="m-4 flex h-[calc(80vh-1rem)] bg-gray-100 border-2 border-primary items-center justify-center text-center">
          <div>
            <p className="text-red-500 text-xl mb-4">Cannot get your location.</p>
            <p className="text-gray-600">Please check your browser's location access permission and reload the page.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    isProcessing ? (
      <ProcessingRequest message="Processing your request..." />
    ) : (
      <div className="relative h-screen w-screen overflow-hidden">
        <Toaster />
        {/* Header overlaying the map */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <Header className=""/>
        </div>
        
        {/* Full-screen map */}
        <div className="absolute inset-0">
          <MapSection {...mapSectionProps} />
        </div>
        
        {/* Legend and Navigation Controls in top-right corner */}
        <div className="absolute top-20 right-4 z-20 flex flex-col gap-3 z-0">
          {/* Legend */}
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 w-40 sm:w-52">
            <h3 className="text-xs sm:text-sm font-bold mb-1 text-gray-700">Store Marks</h3>
            <h4 className="text-[10px] sm:text-xs font-semibold mb-2 text-gray-600">Select store icon or route line for more information</h4>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-3 sm:w-4 mr-1 sm:mr-2" viewBox="0 0 384 512">
                  <path fill={"#fa0202"} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                </svg>
                <span className="text-[10px] sm:text-xs">You</span>
              </div>
              {mapColors && Object.keys(mapColors).map((storeName) => (
                <div key={storeName} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-3 sm:w-4 mr-1 sm:mr-2" viewBox="0 0 384 512">
                    <path fill={mapColors[storeName]} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                  </svg>
                  <span className="text-[10px] sm:text-xs">{storeName}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-3">
            <div className="flex flex-col gap-2">
              {currentPhase === 2 && (
                <button
                  onClick={handleBackPhase}
                  className="mb-2 btn-primary w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-white rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Stores
                </button>
              )}
              {currentPhase === 1 && (
                <button
                  onClick={handleNextPhase}
                  className="mb-2 btn-primary w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-white rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  Find Routes
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => navigate('/get-user-data')}
              className="btn-primary w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-white rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Search
            </button>
          </div>
        </div>
        
        {/* Sidebar overlaying the map */}
        <div className="absolute top-16 left-0 h-[calc(100vh-8rem)] z-20" 
              style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
          <SideBar {...sidebarProps} />
        </div>
      </div>
    )
  );
};

export default MainPage;