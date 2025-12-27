import { useState } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ExploreModal from './components/ExploreModal';
import CreateMenu from '../../components/CreateMenu';
import CreatePostModal from '../home/components/CreatePostModal';
import MobileNav from '../home/components/MobileNav';
import NotificationsPanel from '../home/components/NotificationsPanel';
import GamificationWidget from '../../components/GamificationWidget';
import WalletWidget from '../../components/WalletWidget';
import HeaderActions from '../../components/HeaderActions';
import { useUnreadCounts } from '../../hooks/useUnreadCounts';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showExplore, setShowExplore] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { refreshCounts } = useUnreadCounts();
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

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
      window.REACT_APP_NAVIGATE('/cellar');
    } else if (option === 'food') {
      window.REACT_APP_NAVIGATE('/drinks-food');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="hover:scale-110 transition-transform"
            >
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Mensagens
              </h1>
            </button>
            <HeaderActions
              onShowNotifications={() => setShowNotifications(true)}
              showMenu={true}
              onShowMenu={() => setShowMenu(true)}
            />
          </div>
        </div>
      </header>

      {/* Menu Lateral (Drawer) */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
            onClick={() => setShowMenu(false)}
          ></div>

          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 animate-slideInRight overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 p-4 md:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-2xl font-bold">Menu</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <img
                  src="https://readdy.ai/api/search-image?query=professional%20portrait%20young%20person%20confident%20smile&width=60&height=60&seq=menu-user-messages&orientation=squarish"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">Você</h3>
                  <p className="text-white/90 text-xs md:text-sm">Online</p>
                </div>
              </div>
            </div>

            <div className="p-3 md:p-4 space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className={`${item.icon} text - white text - base md: text - lg`}></i>
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-700 group-hover:text-gray-900 text-sm md:text-base">
                    {item.label}
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-gray-600"></i>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                <i className="ri-message-3-line text-2xl md:text-3xl text-blue-600 mb-2"></i>
                <p className="text-xs md:text-sm text-gray-700 mb-1">Mensagens v1.0</p>
                <p className="text-xs text-gray-500">Conecte-se com amigos</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div className="pt-[57px] md:pt-[73px] pb-20 md:pb-6">
        <div className="h-[calc(100vh-57px)] md:h-[calc(100vh-73px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            <div className={`${selectedChat !== null ? 'hidden lg:block' : 'block'} border - r border - gray - 200 bg - white`}>
              <ChatList
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />
            </div>
            <div className={`${selectedChat !== null ? 'block' : 'hidden lg:block'} lg: col - span - 2 bg - white`}>
              <ChatWindow
                chatId={selectedChat}
                onBack={() => setSelectedChat(null)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="flex items-center justify-around px-2 py-2 sm:py-3">
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <i className="ri-home-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Início</span>
          </button>

          <button className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
            <i className="ri-compass-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Explorar</span>
          </button>

          <button
            onClick={handleCreateClick}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <i className="ri-add-line text-xl sm:text-2xl text-white"></i>
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium">Criar</span>
          </button>

          <button className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
            <i className="ri-movie-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Reels</span>
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

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onRefresh={refreshCounts}
        />
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

      {/* Explore Modal */}
      {showExplore && (
        <ExploreModal onClose={() => setShowExplore(false)} />
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
    </div>
  );
}
