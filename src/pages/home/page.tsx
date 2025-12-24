import { useState } from 'react';
import Feed from './components/Feed';
import Stories from './components/Stories';
import Suggestions from './components/Suggestions';
import MobileNav from './components/MobileNav';
import NotificationsPanel from './components/NotificationsPanel';
import CreatePostModal from './components/CreatePostModal';
import CreateMenu from '../../components/CreateMenu';
import ReelsModal from './components/ReelsModal';
import GamificationWidget from '../../components/GamificationWidget';
import WalletWidget from '../../components/WalletWidget';
import Sidebar from './components/Sidebar';

export default function HomePage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReels, setShowReels] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'explore'>('feed');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const menuItems = [
    { icon: 'ri-wallet-line', label: 'Carteira', action: () => setShowWallet(true) },
    { icon: 'ri-trophy-line', label: 'Conquistas', action: () => setShowGamification(true) },
  ];

  const handleCreateClick = () => {
    setShowCreateMenu(true);
  };

  const handleCreateOption = (option: 'post' | 'travel' | 'cellar' | 'food') => {
    if (option === 'post') {
      setShowCreatePost(true);
    } else if (option === 'travel') {
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
    }
  };

  const handleExploreClick = () => {
    setShowSearchModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          onExploreClick={handleExploreClick}
          onReelsClick={() => setShowReels(true)}
          onCreateClick={handleCreateClick}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Header - Mobile Only */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="hover:scale-110 transition-transform"
            >
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                SARA Travel
              </h1>
              <p className="text-[10px] text-gray-600 -mt-1">where travels come true</p>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative hover:scale-110 transition-transform"
              >
                <i className="ri-notification-line text-xl md:text-2xl text-gray-700"></i>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              <button 
                onClick={() => window.REACT_APP_NAVIGATE('/messages')}
                className="relative hover:scale-110 transition-transform"
              >
                <i className="ri-message-3-line text-xl md:text-2xl text-gray-700"></i>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-white text-[10px] flex items-center justify-center font-medium">
                  2
                </span>
              </button>
              <button 
                onClick={() => window.REACT_APP_NAVIGATE('/profile')}
                className="relative hover:scale-110 transition-transform"
              >
                <i className="ri-user-line text-xl md:text-2xl text-gray-700"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="md:ml-64 pt-[57px] md:pt-0 pb-6 md:pb-20">
        <div className="px-3 sm:px-4 md:px-6 md:py-6">
          <Stories />
          <Feed />
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowSearchModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Explorar</h2>
                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Buscar pessoas, posts, hashtags..."
                  className="w-full px-4 py-3 pl-12 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Trending</h3>
                  <div className="space-y-2">
                    {['#Viagens2024', '#FoodLovers', '#WineTime', '#TravelGoals'].map((tag, i) => (
                      <button key={i} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                        <p className="font-semibold text-gray-900">{tag}</p>
                        <p className="text-sm text-gray-500">{Math.floor(Math.random() * 50 + 10)}k posts</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
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
          onClose={() => setShowCreateMenu(false)}
          onSelectOption={handleCreateOption}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}

      {/* Reels Modal */}
      {showReels && (
        <ReelsModal onClose={() => setShowReels(false)} />
      )}

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="flex items-center justify-around px-2 py-2 sm:py-3">
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-purple-600"
          >
            <i className="ri-home-fill text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Início</span>
          </button>

          <button 
            onClick={handleExploreClick}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <i className="ri-compass-line text-xl sm:text-2xl"></i>
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
            onClick={() => setShowReels(true)}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <i className="ri-movie-line text-xl sm:text-2xl"></i>
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
