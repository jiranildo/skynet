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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="flex items-center justify-around px-2 py-2 sm:py-3">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 ${activeTab === 'feed' ? 'text-purple-600' : 'text-gray-600'}`}
          >
            <i className={`ri-home-${activeTab === 'feed' ? 'fill' : 'line'} text-xl sm:text-2xl`}></i>
            <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Início</span>
          </button>

          <button
            onClick={handleExploreClick}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 ${activeTab === 'explore' ? 'text-purple-600' : 'text-gray-600'}`}
          >
            <i className={`ri-compass-${activeTab === 'explore' ? 'fill' : 'line'} text-xl sm:text-2xl`}></i>
            <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Explorar</span>
          </button>

          <button
            onClick={handleCreateClick}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <i className="ri-add-line text-xl sm:text-2xl text-white"></i>
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Criar</span>
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 ${activeTab === 'reels' ? 'text-purple-600' : 'text-gray-600'}`}
          >
            <i className={`ri-movie-${activeTab === 'reels' ? 'fill' : 'line'} text-xl sm:text-2xl`}></i>
            <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Reels</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
            >
              <i className="ri-menu-line text-xl sm:text-2xl"></i>
              <span className="text-[9px] sm:text-[10px] font-medium">Menu</span>
            </button>

            {/* Dropdown Menu */}
            {showMenuDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[70]"
                  onClick={() => setShowMenuDropdown(false)}
                ></div>
                <div className="absolute bottom-full right-0 mb-2 w-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[80] animate-slideUp">
                  <div className="flex flex-col gap-2 p-3">
                    <button
                      onClick={() => {
                        window.REACT_APP_NAVIGATE('/travel?tab=marketplace');
                        setShowMenuDropdown(false);
                      }}
                      className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Marketplace"
                    >
                      <i className="ri-store-2-fill text-white text-base"></i>
                    </button>
                    <button
                      onClick={() => {
                        setShowWallet(true);
                        setShowMenuDropdown(false);
                      }}
                      className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Carteira"
                    >
                      <i className="ri-wallet-3-fill text-white text-base"></i>
                    </button>
                    <button
                      onClick={() => {
                        setShowGamification(true);
                        setShowMenuDropdown(false);
                      }}
                      className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Conquistas"
                    >
                      <i className="ri-trophy-fill text-white text-base"></i>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

    </div>
  );
}
