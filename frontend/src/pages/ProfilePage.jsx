import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import SimpleFooter from '../components/SimpleFooter';
import ProfileHeader from '../components/Profile/ProfileHeader';
import NavigationTabs from '../components/Profile/NavigationTabs';
import ProfileInfo from '../components/Profile/ProfileInfo';
import SearchHistory from '../components/Profile/SearchHistory';
import HistoryModal from '../components/Profile/HistoryModal';
import StoreModal from '../components/Profile/StoreModal';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showStoreModal, setShowStoreModal] = useState(false);

  const fetchSearchHistory = async () => {
    try {
      setIsLoading(true);
      const userId = user?.id;
      
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/search-history/${userId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }
      
      const data = await response.json();
      setSearchHistory(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching search history:', error);
      setIsLoading(false);
    }
  };

  const clearSearchHistory = async () => {
    try {
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!userId) return;
      
      const response = await fetch(`http://localhost:5000/api/search-history/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear search history');
      }
      
      setSearchHistory([]);
      toast.success('Search history cleared successfully!');
    } catch (error) {
      console.error('Error clearing search history:', error);
      toast.error('Failed to clear search history');
    }
  };

  useEffect(() => {
    fetchSearchHistory();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const openHistoryDetail = (historyItem) => {
    setSelectedHistory(historyItem);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedHistory(null);
  };
  
  const openStoreDetail = (store) => {
    setSelectedStore(store);
    setShowStoreModal(true);
  };
  
  const closeStoreModal = () => {
    setShowStoreModal(false);
    setSelectedStore(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-[#C8E6D0]">
      <Toaster />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <ProfileHeader user={user} handleLogout={handleLogout} />
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="p-6">
            {activeTab === 'profile' && (
              <ProfileInfo user={user} setActiveTab={setActiveTab} />
            )}
            {activeTab === 'history' && (
              <SearchHistory
                isLoading={isLoading}
                searchHistory={searchHistory}
                openHistoryDetail={openHistoryDetail}
                clearSearchHistory={clearSearchHistory}
                navigate={navigate}
              />
            )}
          </div>
        </motion.div>
      </main>
      
      <HistoryModal
        showHistoryModal={showHistoryModal}
        selectedHistory={selectedHistory}
        closeHistoryModal={closeHistoryModal}
        openStoreDetail={openStoreDetail}
        navigate={navigate}
      />
      
      <StoreModal
        showStoreModal={showStoreModal}
        selectedStore={selectedStore}
        closeStoreModal={closeStoreModal}
      />
      
      <SimpleFooter />
    </div>
  );
};

export default ProfilePage;