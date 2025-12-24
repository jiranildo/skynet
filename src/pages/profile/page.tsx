import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreateMenu from '../../components/CreateMenu';
import CreatePostModal from '../home/components/CreatePostModal';
import NotificationsPanel from '../home/components/NotificationsPanel';
import GamificationWidget from '../../components/GamificationWidget';
import WalletWidget from '../../components/WalletWidget';

type TabType = 'posts' | 'reels' | 'saved' | 'tagged';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [, setShowReels] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const tabs = [
    { id: 'posts' as TabType, icon: 'ri-grid-line', label: 'Posts' },
    { id: 'reels' as TabType, icon: 'ri-movie-line', label: 'Reels' },
    { id: 'saved' as TabType, icon: 'ri-bookmark-line', label: 'Salvos' },
    { id: 'tagged' as TabType, icon: 'ri-user-line', label: 'Marcações' },
  ];

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

  const posts = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    image: `https://readdy.ai/api/search-image?query=beautiful%20lifestyle%20photography%20modern%20aesthetic%20minimalist%20composition%20high%20quality%20professional%20shot&width=400&height=400&seq=profile-post-${i + 1}&orientation=squarish`,
    likes: Math.floor(Math.random() * 5000) + 100,
    comments: Math.floor(Math.random() * 500) + 10,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="hover:scale-110 transition-transform"
            >
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 bg-clip-text text-transparent">
                Perfil
              </h1>
            </button>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative hover:scale-110 transition-transform"
              >
                <i className="ri-notification-line text-xl md:text-2xl text-gray-700"></i>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/messages')}
                className="relative hover:scale-110 transition-transform"
              >
                <i className="ri-message-3-line text-xl md:text-2xl text-gray-700"></i>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              </button>
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/profile')}
                className="hover:scale-110 transition-transform"
              >
                <i className="ri-user-line text-xl md:text-2xl text-gray-700"></i>
              </button>
            </div>
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
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 md:p-6 text-white">
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
                  src="https://readdy.ai/api/search-image?query=professional%20portrait%20young%20person%20confident%20smile&width=60&height=60&seq=menu-user-profile&orientation=squarish"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">{user.user_metadata?.full_name || 'Usuário'}</h3>
                  <p className="text-white/90 text-xs md:text-sm">{user.email}</p>
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
                  className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className={`${item.icon} text-white text-base md:text-lg`}></i>
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-700 group-hover:text-gray-900 text-sm md:text-base">
                    {item.label}
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-gray-600"></i>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-center">
                <i className="ri-user-line text-2xl md:text-3xl text-gray-700 mb-2"></i>
                <p className="text-xs md:text-sm text-gray-700 mb-1">Perfil v1.0</p>
                <p className="text-xs text-gray-500">Sua identidade social</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div className="pt-[57px] md:pt-[73px] pb-20 md:pb-6">
        <div className="px-3 sm:px-4 md:px-6 max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20portrait%20young%20person%20confident%20smile%20modern%20aesthetic&width=150&height=150&seq=profile-avatar&orientation=squarish"
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-100"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{user.user_metadata?.full_name || 'Usuário'}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600'
                        }`}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors whitespace-nowrap">
                      Mensagem
                    </button>
                  </div>
                </div>

                <div className="flex justify-center sm:justify-start gap-6 mb-3">
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-gray-900">342</div>
                    <div className="text-xs md:text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-gray-900">12.5k</div>
                    <div className="text-xs md:text-sm text-gray-600">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-gray-900">1.2k</div>
                    <div className="text-xs md:text-sm text-gray-600">Seguindo</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{user.email}</h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-2">
                    Apaixonado por viagens, gastronomia e vinhos 🍷✈️🍽️
                  </p>
                  <a href="#" className="text-orange-500 hover:text-orange-600 font-medium text-xs md:text-sm">
                    www.seusite.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-4">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <i className={`${tab.icon} text-base sm:text-lg`}></i>
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square bg-gray-100 rounded-sm sm:rounded-lg overflow-hidden group cursor-pointer"
              >
                <img
                  src={post.image}
                  alt={`Post ${post.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1 text-white">
                    <i className="ri-heart-fill text-base sm:text-xl"></i>
                    <span className="font-bold text-xs sm:text-sm">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white">
                    <i className="ri-chat-3-fill text-base sm:text-xl"></i>
                    <span className="font-bold text-xs sm:text-sm">{post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
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

          <button
            onClick={() => setShowReels(true)}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
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
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
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
