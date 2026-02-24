import { useState, useEffect } from 'react';
import Feed from './components/Feed';
import Stories from './components/Stories';
import Suggestions from './components/Suggestions';
import MobileNav from './components/MobileNav';
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
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          onExploreClick={handleExploreClick}
          onReelsClick={() => setActiveTab('reels')}
          onCreateClick={handleCreateClick}
          activeTab={activeTab}
          onTabChange={setActiveTab as any}
          onWalletClick={() => setShowWallet(true)}
          onGamificationClick={() => setShowGamification(true)}
        />
      </div>

      {/* Header - Mobile Only */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setActiveTab('feed'); window.REACT_APP_NAVIGATE('/'); }}
              className="hover:scale-110 transition-transform"
            >
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                SARA Travel
              </h1>
              <p className="text-[10px] text-gray-600 -mt-1">where travels come true</p>
            </button>
            <HeaderActions
              onShowNotifications={() => setShowNotifications(!showNotifications)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="md:ml-64 pt-[57px] md:pt-0 pb-32 md:pb-20">
        <div className="px-3 sm:px-4 md:px-6 md:py-6">
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
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onRefresh={refreshCounts}
        />
      )}

      {/* Gamification Modal */}
      {showGamification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowGamification(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <GamificationWidget onClose={() => setShowGamification(false)} />
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWallet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowWallet(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <WalletWidget onClose={() => setShowWallet(false)} />
          </div>
        </div>
      )}

      {/* Create Menu Modal */}
      {showCreateMenu && (
        <CreateMenu
          onClose={() => { setShowCreateMenu(false); }}
          onSelectOption={handleCreateOption}
        />
      )}

      {/* Check-In Modal */}
      {showCheckIn && (
        <CheckInModal onClose={() => setShowCheckIn(false)} />
      )}

      {/* Unified Create Modal */}
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

      {/* Mobile Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateClick={handleCreateClick}
        onMenuClick={() => setShowMenuDropdown(!showMenuDropdown)}
        extraItems={showMenuDropdown ? [
          {
            id: 'marketplace',
            icon: 'ri-store-2-fill',
            label: 'Market',
            onClick: () => {
              window.REACT_APP_NAVIGATE('/travel?tab=marketplace');
              setShowMenuDropdown(false);
            }
          },
          {
            id: 'wallet',
            icon: 'ri-wallet-3-fill',
            label: 'Carteira',
            onClick: () => {
              setShowWallet(true);
              setShowMenuDropdown(false);
            }
          },
          {
            id: 'awards',
            icon: 'ri-trophy-fill',
            label: 'Conquistas',
            onClick: () => {
              setShowGamification(true);
              setShowMenuDropdown(false);
            }
          }
        ] : []}
      />
    </div>
  );
}
