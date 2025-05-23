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
import { API_CONFIG } from '../lib/config';
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const fetchSearchHistory = async () => {
    try {
      setIsLoading(true);
      const userId = user?.id;
      
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`/api/user/history`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }
      
      const res = await response.json();
      setSearchHistory(res.data.history);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching search history:', error);
      setIsLoading(false);
    }
  };

  const clearSearchHistory = async () => {
    try {
      const userId = user?.id;
      
      if (!userId) return;
      
      const response = await fetch(`/api/user/history/clear`, {
        method: 'DELETE',
        credentials: 'include',
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
                user={user}
                setSearchHistory={setSearchHistory}
              />
            )}
          </div>
        </motion.div>
      </main>
      
      <SimpleFooter />
    </div>
  );
};

export default ProfilePage;