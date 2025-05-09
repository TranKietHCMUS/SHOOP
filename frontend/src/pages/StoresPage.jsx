import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { mapColors } from '../lib/map_colors';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../lib/config';
import SimpleFooter from '../components/SimpleFooter';
import CustomScrollbar from '../components/SubComponents/Scrollbar';

const StoresPage = () => {
  const [storesByName, setStoresByName] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        // Lấy danh sách tất cả cửa hàng từ các loại trong map_colors
        const storePromises = Object.keys(mapColors).map(storeName => {
            const url = new URL(`${API_CONFIG.BASE_URL}/store`);
            url.searchParams.append("name", storeName);
          
            return fetch(url.toString(), {
              method: "GET",
              headers: {
                "Accept": "application/json"
              }
            }).then(res => {
              if (!res.ok) throw new Error("Network response was not ok");
              return res.json();
            });
          });          
        
        const responses = await Promise.all(storePromises);
        const storesData = responses.flatMap(response => 
          response.message || []
        ).filter(store => store);
        
        // Nhóm cửa hàng theo tên
        const groupedStores = {};
        storesData.forEach(store => {
          if (!groupedStores[store.name]) {
            groupedStores[store.name] = [];
          }
          groupedStores[store.name].push(store);
        });
        
        setStoresByName(groupedStores);
      } catch (err) {
        console.log('Error fetching stores:', err);
        toast.error("Cannot fetch stores");
        setError("Không thể tải danh sách cửa hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-[#C8E6D0] flex flex-col">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Our store connections</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B14F]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-center text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(storesByName).map(([storeName, branches]) => (
              <div key={storeName} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: mapColors[storeName] || '#000' }}>
                  {storeName}: {branches.length} stores connected
                </h2>
                <CustomScrollbar className="mt-2 max-h-[300px] overflow-y-auto">
                  <div className="mt-2 max-h-[300px] overflow-y-auto">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">List of stores</h3>
                    <ul className="space-y-2 list-disc pl-5">
                    {branches.map((branch, index) => (
                      <li key={index} className="text-gray-600">
                        {branch.address}
                      </li>
                    ))}
                    </ul>
                  </div>
                </CustomScrollbar>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <div className="mt-auto">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default StoresPage; 