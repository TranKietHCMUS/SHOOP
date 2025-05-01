import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import MapContainer from '../components/Map/MapContainer';
import SideBar from '../components/Map/SideBar';
import ProcessingRequest from '../components/ProcessingRequest';
import { Toaster, toast } from 'react-hot-toast';
import Header from '../components/Header';
import { mapColors } from '../lib/map_colors';
import { useNavigate } from 'react-router-dom';
const MapSection = React.memo(({ 
  stores, 
  onStoreClick, 
  renderAdditionalLayers, 
  routes,
  radius,
  userLocation 
}) => {
  console.log('MapSection received userLocation:', userLocation);
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
  // State cho map và UI cũ
  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState('store');
  const [routes, setRoutes] = useState([]);
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Hàm xử lý tuần tự: lấy vị trí -> gọi API
  const processSearchWithLocation = useCallback(async () => {
    if (!searchData) {
      toast.error('No search data found');
      setIsProcessing(false);
      return;
    }

    console.log('Starting search process...');
    let fetchedLocation = null;
    try {
      // Bước 1: Lấy vị trí người dùng
      console.log('Getting user location...');
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Trình duyệt của bạn không hỗ trợ định vị.'));
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
      console.log('User location obtained:', fetchedLocation);
      setUserLocation(fetchedLocation);

      // Bước 2: Gọi API với vị trí đã lấy được
      console.log('Calling API with:', { searchData, user_location: fetchedLocation });
      setIsProcessing(true);
      const response = await fetch('http://127.0.0.1:5000/api/search/nearby', {
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
      // Phân biệt lỗi định vị và lỗi API
      if (!fetchedLocation) { // Nếu lỗi xảy ra trước khi lấy được vị trí
         toast.error(`Navigator error: ${error.message}`);
      } else {
         toast.error(`Searching error: ${error.message}`);
      }
      // Không set userLocation nếu lỗi xảy ra trước khi lấy được vị trí
      if (!fetchedLocation) setUserLocation(null);
    } finally {
      setIsProcessing(false);
    }
  }, [searchData]);

  useEffect(() => {
    setIsProcessing(true);
    processSearchWithLocation();
  }, [processSearchWithLocation]);

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
    console.log('User location handleNextPhase:', userLocation);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/search/plans', {
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
      console.log('Routes PHASE 2:', data);
      setRoutes(data);
      setCurrentPhase(2);
      setSelectedStore(null);
      setActiveTab('route');
      setIsProcessing(false);
      toast.success('Found routes!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#00B14F',
          color: '#fff',
        },
      });
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
  
    // Clear existing polylines directly rather than using state
    if (map) {
      // Remove existing polylines if they exist in a ref
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
  
    routesToRender.forEach((route, index) => {
      if (!route || !Array.isArray(route.coordinates) || route.coordinates.length < 2) {
        console.warn("Invalid route:", route);
        return;
      }
  
      const origin = route.coordinates[0];
      const destination = route.coordinates[route.coordinates.length - 1];
      const waypoints = route.coordinates.slice(1, -1).map(coord => ({
        location: coord,
        stopover: true,
      }));
  
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: googleApi.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === googleApi.maps.DirectionsStatus.OK && result.routes.length > 0) {
            const isSelected = selectedRoute && selectedRoute.id === route.id;
            let strokeColor;
            if (isSelected) {
              strokeColor = '#00B14F'; // Green for selected
            } else if (index === 0) {
              strokeColor = '#FF4500'; // Orange-red for first route
            } else {
              strokeColor = '#4285F4'; // Blue for other routes
            }
            
            // Base styling
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
            
            // Add hover effect to route
            const hoverWeight = isSelected ? 12 : 9;
            
            // Add mouse listeners for hover effects
            googleApi.maps.event.addListener(path, 'mouseover', () => {
              path.setOptions({
                strokeWeight: hoverWeight,
                strokeOpacity: 0.9,
                zIndex: 1001 // Ensure hovered route is on top
              });
            });
            
            googleApi.maps.event.addListener(path, 'mouseout', () => {
              path.setOptions({
                strokeWeight,
                strokeOpacity: 0.7,
                zIndex: isSelected ? 1000 : 900 - index
              });
            });
  
            // Click handler - show sidebar with route info
            const listener = googleApi.maps.event.addListener(path, 'click', () => {
              console.log("Route clicked:", route.id);
              
              // Highlight the route even more on click
              path.setOptions({
                strokeWeight: hoverWeight,
                strokeOpacity: 1,
                zIndex: 1001
              });
              
              // After a short delay, reduce the highlight a bit but keep it visible
              setTimeout(() => {
                if (path) {
                  path.setOptions({
                    strokeWeight: isSelected ? 12 : 10,
                    strokeOpacity: 0.9
                  });
                }
              }, 300);
              
              // Show the route details in sidebar
              handleRouteClick(route);
              setIsSidebarCollapsed(false); // Ensure sidebar is visible
            });
  
            renderedRoutes.push({ path, listener });
            // Also store in ref for cleanup
            routePolylinesRef.current.push({ path, listener });
          } else {
            console.warn('Directions request failed:', status);
          }
        }
      );
    });
  
    return renderedRoutes;
  }, [handleRouteClick, selectedRoute, setIsSidebarCollapsed]);
  
  // Add this useEffect in your component to handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup polylines when component unmounts
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
  

  // Memoize sidebar props
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
    console.log('Updating mapSectionProps with userLocation:', userLocation);
    console.log('Stores being passed to MapSection:', storesToShow);
     console.log('Routes being passed to MapSection:', routes);

    return {
      stores: storesToShow, // Sử dụng stores từ API
      radius: parseInt(searchData.expected_radius) * 1000, 
      onStoreClick: handleStoreClick,
      renderAdditionalLayers: currentPhase === 2 ? (map, google) => renderRoutes(map, google, routes) : null, // Truyền hàm render với routes hiện tại
      routes: routes, // Truyền routes để MapContainer biết khi nào cần vẽ lại
      userLocation // Truyền userLocation đã lấy được
      // Loại bỏ các props không còn dùng trong MapSection: currentPhase, handleBackPhase, handleNextPhase
    };
  }, [searchResults, handleStoreClick, currentPhase, renderRoutes, routes, userLocation]); // Phụ thuộc vào searchResults và routes

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
        <div className="absolute top-20 right-4 z-20 flex flex-col gap-3">
          {/* Legend */}
          <div className="bg-white rounded-lg shadow-md p-3 w-52">
            <h3 className="text-sm font-bold mb-1 text-gray-700">Store Marks</h3>
            <h4 className="text-xs font-semibold mb-2 text-gray-600">Select store icon or route line for more information</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-4 mr-2" viewBox="0 0 384 512">
                  <path fill={"#fa0202"} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                </svg>
                <span className="text-xs">You</span>
              </div>
              {mapColors && Object.keys(mapColors).map((storeName) => (
                <div key={storeName} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-4 mr-2" viewBox="0 0 384 512">
                    <path fill={mapColors[storeName]} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                  </svg>
                  <span className="text-xs">{storeName}</span>
                </div>
              ))}
              {/* <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-4 mr-2" viewBox="0 0 384 512">
                  <path fill={mapColors["Bách hóa xanh"]} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                </svg>
                <span className="text-xs">Bách hóa xanh</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-4 mr-2" viewBox="0 0 384 512">
                  <path fill={mapColors["WinMart"]} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                </svg>
                <span className="text-xs">WinMart</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-4 mr-2" viewBox="0 0 384 512">
                  <path fill={mapColors["FamilyMart"]} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                </svg>
                <span className="text-xs">FamilyMart</span>
              </div> */}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex flex-col gap-2">
              {currentPhase === 2 && (
                <button
                  onClick={handleBackPhase}
                  className="mb-2 btn-primary w-full px-3 py-2 text-sm text-white rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Stores
                </button>
              )}
              {currentPhase === 1 && (
                <button
                  onClick={handleNextPhase}
                  className="mb-2 btn-primary w-full px-3 py-2 text-sm text-white rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  Find Routes
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => navigate('/get-user-data')}
              className="btn-primary w-full px-3 py-2 text-sm text-white rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Search
            </button>
          </div>
        </div>
        
        
        
        {/* Sidebar overlaying the map */}
        <div className="m-4 absolute top-16 left-0 h-[calc(100vh-8rem)] z-20" 
              style={{ marginLeft: '2rem'}}>
          <SideBar {...sidebarProps} />
        </div>
      </div>
    )
  );
};

export default MainPage;