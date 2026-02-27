import { useState, useEffect } from 'react';
import Feed from './components/Feed';
import Stories from './components/Stories';
import Suggestions from './components/Suggestions';

import NotificationsPanel from './components/NotificationsPanel';
import CreateReelModal from './components/CreateReelModal';
import CreateStoryModal from './components/CreateStoryModal';
import CreateMenu from '../../components/CreateMenu';
import CheckInModal from '../../components/CheckInModal';
import ReelsModal from './components/ReelsModal';
import ReelsView from './components/ReelsView';
import GamificationWidget from '../../components/GamificationWidget';
import WalletWidget from '../../components/WalletWidget';
import Sidebar from './components/Sidebar';
import ExploreView from './components/ExploreView';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUnreadMessagesCount, getUnreadNotificationsCount } from '@/services/supabase';
import HeaderActions from '../../components/HeaderActions';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

export default function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { unreadMessages, unreadNotifications, refreshCounts } = useUnreadCounts();

  const [showReels, setShowReels] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  // Unified Modal State: We can use a single state object or just reuse showCreateStory
  // Let's refactor to `createModalTab: 'POST' | 'STORY' | 'REEL' | 'TEMPLATES' | null`
  const [createModalTab, setCreateModalTab] = useState<'POST' | 'STORY' | 'REEL' | 'TEMPLATES' | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'reels'>('feed');
  const [editingPost, setEditingPost] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleCreateClick = () => {
    setShowCreateMenu(true);
  };

  const handleCreateOption = (option: string) => {
    if (option === 'post') setCreateModalTab('POST');
    if (option === 'reel') setCreateModalTab('REEL');
    if (option === 'story') setCreateModalTab('STORY');

    // Legacy/Other options
    if (option === 'travel') {
      window.REACT_APP_NAVIGATE('/travel');
    } else if (option === 'cellar') {
      setShowCreateMenu(false);
      window.REACT_APP_NAVIGATE('/cellar');
      setTimeout(() => {
        const myWinesButton = document.querySelector('[data-tab="my-wines"]') as HTMLButtonElement;
        if (myWinesButton) {
          myWinesButton.click();
        }
      }, 100);
    } else if (option === 'food') {
      window.REACT_APP_NAVIGATE('/drinks-food');
    } else if (option === 'checkin') {
      setShowCheckIn(true);
    }
  };

  const handleExploreClick = () => {
    setActiveTab('explore');
  };

  return (
    <div className="md:py-6">
      <div className="animate-fadeIn">
        {activeTab === 'feed' ? (
          <>
            <Stories />
            <Feed onEdit={(post) => {
              setEditingPost(post);
              setCreateModalTab('POST');
            }} />
          </>
        ) : activeTab === 'explore' ? (
          <ExploreView />
        ) : (
          <div className="fixed inset-0 top-[57px] bottom-[72px] md:top-0 md:bottom-0 md:left-64 bg-black z-10 overflow-hidden">
            <ReelsView onCreateReel={() => setCreateModalTab('REEL')} />
          </div>
        )}
      </div>

      {/* Unified Create Modal (Local editing state) */}
      {(createModalTab || editingPost) && (
        <CreateStoryModal
          onClose={() => {
            setCreateModalTab(null);
            setEditingPost(null);
          }}
          onSuccess={() => {
            setCreateModalTab(null);
            setEditingPost(null);
            window.location.reload();
          }}
          initialTab={createModalTab || 'POST'}
          editingPost={editingPost}
        />
      )}
    </div>
  );
}
