import React, { useState, useCallback, useMemo } from 'react';
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
  handleNextPhase 
}) => {
  return (
    <div className="flex-1 relative p-6">
      <MapContainer
        stores={stores}
        onStoreClick={onStoreClick}
        renderAdditionalLayers={renderAdditionalLayers}
        routes={routes}
      />
    </div>
  );
});

MapSection.displayName = 'MapSection';

const MainPage = () => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState('store');
  const [routes, setRoutes] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize callbacks
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
      toast.success('Đã tìm thấy các tuyến đường phù hợp!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#00B14F',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tìm tuyến đường. Vui lòng thử lại!', {
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
  }, []);

  // Memoize renderRoutes function
  const renderRoutes = useCallback((map, googleApi, routes) => {
    return routes.map((route, index) => {
      const path = new googleApi.maps.Polyline({
        path: route.coordinates,
        geodesic: true,
        strokeColor: index === 0 ? '#FF0000' : '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      path.setMap(map);
      path.addListener('click', () => handleRouteClick(route));

      return path;
    });
  }, [handleRouteClick]);

  // Memoize sidebar props
  const sidebarProps = useMemo(() => ({
    currentPhase,
    selectedStore,
    selectedRoute,
    activeTab,
    onTabChange: handleTabChange
  }), [currentPhase, selectedStore, selectedRoute, activeTab, handleTabChange]);

  // Memoize map section props
  const mapSectionProps = useMemo(() => ({
    stores: mockStores,
    onStoreClick: handleStoreClick,
    renderAdditionalLayers: currentPhase === 2 ? renderRoutes : null,
    routes,
    currentPhase,
    handleBackPhase,
    handleNextPhase
  }), [currentPhase, handleStoreClick, renderRoutes, routes, handleBackPhase, handleNextPhase]);

  if (isProcessing) {
    return <ProcessingRequest message="Hệ thống đang tìm kiếm các tuyến đường phù hợp..." />;
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