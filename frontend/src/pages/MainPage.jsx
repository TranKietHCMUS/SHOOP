import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MapContainer from '../components/Map/MapContainer';
import SideBar from '../components/Map/SideBar';
import ProcessingRequest from '../components/ProcessingRequest';
import { Toaster, toast } from 'react-hot-toast';
import Header from '../components/Header';

// Mock data được chuyển ra ngoài component để tránh tạo lại mỗi lần render
const mockStores = [
  {
    id: 1,
    name: "Circle K Nguyễn Văn Cừ",
    address: "123 Nguyễn Văn Cừ, P4, Q5, TP.HCM",
    coordinates: { lat: 10.762622, lng: 106.682220 },
    products: ["Nước giải khát", "Bánh kẹo", "Mì gói"]
  },
  {
    id: 2,
    name: "GS25 Lý Thường Kiệt",
    address: "456 Lý Thường Kiệt, P14, Q10, TP.HCM",
    coordinates: { lat: 10.760000, lng: 106.680000 },
    products: ["Đồ ăn vặt", "Nước uống", "Văn phòng phẩm"]
  }
];

const mockRoutes = [
  {
    id: 1,
    start: "Circle K Nguyễn Văn Cừ",
    end: "GS25 Lý Thường Kiệt",
    distance: 2.5,
    duration: 15,
    coordinates: [
      { lat: 10.762622, lng: 106.682220 },
      { lat: 10.761000, lng: 106.681000 },
      { lat: 10.760000, lng: 106.680000 }
    ],
    waypoints: [
      "Circle K Nguyễn Văn Cừ",
      "Ngã tư Nguyễn Văn Cừ - Lý Thường Kiệt",
      "GS25 Lý Thường Kiệt"
    ]
  },
  {
    id: 2,
    start: "Circle K Nguyễn Văn Cừ",
    end: "GS25 Lý Thường Kiệt",
    distance: 3.0,
    duration: 20,
    coordinates: [
      { lat: 10.762622, lng: 106.682220 },
      { lat: 10.763000, lng: 106.683000 },
      { lat: 10.760000, lng: 106.680000 }
    ],
    waypoints: [
      "Circle K Nguyễn Văn Cừ",
      "Đường vòng qua khu dân cư",
      "GS25 Lý Thường Kiệt"
    ]
  }
];

const MapSection = React.memo(({ 
  stores, 
  onStoreClick, 
  renderAdditionalLayers, 
  routes,
  currentPhase,
  handleBackPhase,
  handleNextPhase,
  userLocation 
}) => {
  console.log('MapSection received userLocation:', userLocation);
  return (
    <div className="flex-1 relative p-6">
      <MapContainer
        stores={stores}
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

  // State cho map và UI cũ
  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState('store');
  const [routes, setRoutes] = useState([]);

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
      const response = await fetch('http://localhost:5000/user/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...searchData,
          user_location: fetchedLocation
        })
      });

      if (!response.ok) {
        throw new Error('Error in API call');
      }

      const data = await response.json();
      console.log('Search results received:', data);
      setSearchResults(data);
      toast.success('Tìm kiếm thành công!');

    } catch (error) {
      console.error('Lỗi trong quá trình tìm kiếm:', error);
      // Phân biệt lỗi định vị và lỗi API
      if (!fetchedLocation) { // Nếu lỗi xảy ra trước khi lấy được vị trí
         toast.error(`Lỗi định vị: ${error.message}`);
      } else {
         toast.error(`Lỗi tìm kiếm: ${error.message}`);
      }
      // Không set userLocation nếu lỗi xảy ra trước khi lấy được vị trí
      if (!fetchedLocation) setUserLocation(null);
    } finally {
      setIsProcessing(false);
    }
  }, [searchData]);

  // Gọi quy trình khi component mount
  useEffect(() => {
    setIsProcessing(true);
    processSearchWithLocation();
  }, [processSearchWithLocation]);

  const handleStoreClick = useCallback((store) => {
    setSelectedStore(store);
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
      await new Promise(resolve => setTimeout(resolve, 15000));
      setRoutes(mockRoutes);
      setCurrentPhase(2);
      setSelectedStore(null);
      setActiveTab('route');
      toast.success('Found routes!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#00B14F',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error('An error occurred while finding routes. Please try again!', {
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
  }, []);

  const handleBackPhase = useCallback(() => {
    setCurrentPhase(1);
    setSelectedRoute(null);
    setRoutes([]);
    setActiveTab('store');
    setSelectedStore(null);
  }, []);

  // Memoize renderRoutes function
  // Memoize renderRoutes function
  const renderRoutes = useCallback((map, googleApi, routesToRender) => {
    console.log("Rendering routes:", routesToRender);
   return routesToRender.map((route, index) => {
     // Kiểm tra xem route và route.coordinates có tồn tại không
     if (!route || !Array.isArray(route.coordinates)) {
       console.warn("Invalid route object:", route);
       return null; // Bỏ qua route không hợp lệ
     }
      // Xác định màu dựa trên route được chọn
     const isSelected = selectedRoute && selectedRoute.id === route.id;
     const strokeColor = isSelected ? '#0000FF' : (index === 0 ? '#FF0000' : '#4285F4'); // Xanh dương nếu được chọn, đỏ cho route đầu, xanh google cho các route khác
     const strokeWeight = isSelected ? 4 : 2; // Dày hơn nếu được chọn
     const zIndex = isSelected ? 1 : 0; // Ưu tiên hiển thị route được chọn

     const path = new googleApi.maps.Polyline({
       path: route.coordinates,
       geodesic: true,
       strokeColor: strokeColor,
       strokeOpacity: 0.8,
       strokeWeight: strokeWeight,
       zIndex: zIndex,
       map: map, // Thêm map vào đây để hiển thị ngay
     });


     const listener = path.addListener('click', () => {
        console.log("Route clicked:", route.id);
        handleRouteClick(route);
     });

      // Trả về object chứa path và listener để có thể xóa sau này
      return { path, listener };

   });
  }, [handleRouteClick, selectedRoute]);

  // Memoize sidebar props
  const sidebarProps = useMemo(() => ({
    currentPhase,
    selectedStore,
    selectedRoute,
    activeTab,
    onTabChange: handleTabChange,
    searchResults: searchResults?.stores || [], // Truyền stores từ searchResults
    routes, // Truyền routes đã tìm được (hoặc mock)
    isLoadingRoutes: isProcessing && currentPhase === 1, // Cờ báo đang tìm routes
    isLoadingSearch: isProcessing && userLocation === null, // Cờ báo đang tìm kiếm ban đầu
    onFindRoutes: handleNextPhase, // Truyền hàm tìm route
    onBack: handleBackPhase // Truyền hàm quay lại
  }), [currentPhase, selectedStore, selectedRoute, activeTab, handleTabChange, searchResults, routes, isProcessing, userLocation, handleNextPhase, handleBackPhase]);


  // Memoize map section props
  const mapSectionProps = useMemo(() => {
    // Chỉ truyền stores từ kết quả tìm kiếm API
     const storesToShow = searchResults?.stores || [];
    console.log('Updating mapSectionProps with userLocation:', userLocation);
    console.log('Stores being passed to MapSection:', storesToShow);
     console.log('Routes being passed to MapSection:', routes);

    return {
      stores: storesToShow, // Sử dụng stores từ API
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
            <p className="text-red-500 text-xl mb-4">Không thể lấy được vị trí của bạn.</p>
            <p className="text-gray-600">Vui lòng kiểm tra quyền truy cập vị trí trong trình duyệt và thử tải lại trang.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <Header />
      <div className="m-4 flex h-[calc(80vh-1rem)] bg-gray-100 border-2 border-primary">
        <SideBar {...sidebarProps} />
        <div className="flex flex-col flex-1">
          <MapSection {...mapSectionProps} className="h-3/4" />
          <div className="flex flex-row p-4 pl-6 pt-0 text-lg text-primary justify-between">
            <div className="flex flex-col gap-2">
              <p>
                <span className="text-green-600 font-semibold">You are here </span> 
                <span className="text-red-500">📍</span>
              </p>
              <p>
                Click on <span className="text-green-600">📍</span> to see the detail information of the store
              </p>
            </div>
            <div className="flex content-end flex-wrap">
              {currentPhase === 2 && (
                <button
                  onClick={handleBackPhase}
                  className="btn-primary px-4 py-2  text-white rounded-md transition-colors duration-200"
                >
                  Back
                </button>
              )}
              {currentPhase === 1 && (
                <button
                  onClick={handleNextPhase}
                  className="btn-primary px-4 py-2 text-white rounded-md transition-colors duration-200"
                >
                  Find routes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage; 