import { useState } from 'react';
import SuggestionsTab from './components/SuggestionsTab';
import HistoryTab from './components/HistoryTab';
import GoalsTab from './components/GoalsTab';
import StatsTab from './components/StatsTab';
import CreateMenu from '../../components/CreateMenu';
import CreatePostModal from '../home/components/CreatePostModal';
import NotificationsPanel from '../home/components/NotificationsPanel';
import AddExperienceModal from './components/AddExperienceModal';
import MobileNav from '../home/components/MobileNav';
import HeaderActions from '../../components/HeaderActions';
import { useUnreadCounts } from '../../hooks/useUnreadCounts';
import { useAuth } from '../../context/AuthContext';

type TabType = 'suggestions' | 'history' | 'goals' | 'stats';

export default function DrinksFoodPage() {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);

  // Trigger for refreshing history
  const [experienceTimestamp, setExperienceTimestamp] = useState(Date.now());

  const { refreshCounts } = useUnreadCounts();
  const { user } = useAuth(); // Assuming useAuth is needed for MobileNav or other parts, keeping it as per snippet.

  const tabs = [
    { id: 'history' as TabType, icon: 'ri-history-line', label: 'Experiências' },
    { id: 'suggestions' as TabType, icon: 'ri-lightbulb-line', label: 'Sugestões' },
    { id: 'goals' as TabType, icon: 'ri-trophy-line', label: 'Metas' },
    { id: 'stats' as TabType, icon: 'ri-bar-chart-box-line', label: 'Estatísticas' },
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
      setActiveTab('suggestions');
    }
  };

  const handleExploreClick = () => {
    setActiveTab('suggestions');
  };

  const handleAddExperienceClick = () => {
    setShowAddExperience(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="hover:scale-110 transition-transform"
            >
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Drinks & Food
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
            <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 p-4 md:p-6 text-white">
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
                  src="https://readdy.ai/api/search-image?query=professional%20portrait%20young%20person%20confident%20smile&width=60&height=60&seq=menu-user-food&orientation=squarish"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">Você</h3>
                  <p className="text-white/90 text-xs md:text-sm">Foodie Nível 4</p>
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
                  className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
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
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 text-center">
                <i className="ri-restaurant-line text-2xl md:text-3xl text-amber-600 mb-2"></i>
                <p className="text-xs md:text-sm text-gray-700 mb-1">Drinks & Food v1.0</p>
                <p className="text-xs text-gray-500">Suas experiências gastronômicas</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="fixed top-[57px] md:top-[73px] left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-30">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] sm:min-w-[100px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap relative ${activeTab === tab.id
                ? 'text-amber-600 bg-amber-50/50'
                : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50/30'
                }`}
            >
              <i className={`${tab.icon} text-lg sm:text-xl`}></i>
              <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-[114px] md:pt-[130px] pb-20 md:pb-6">
        <div className="px-3 sm:px-4 md:px-6">
          {activeTab === 'suggestions' && <SuggestionsTab />}
          {activeTab === 'history' && <HistoryTab lastUpdated={experienceTimestamp} />}
          {activeTab === 'goals' && <GoalsTab />}
          {activeTab === 'stats' && <StatsTab />}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="flex items-center justify-around px-2 py-2 sm:py-3">
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <i className="ri-home-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Início</span>
          </button>

          <button
            onClick={handleExploreClick}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
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
            onClick={handleAddExperienceClick}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <i className="ri-star-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Experiência</span>
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

      {/* Add Experience Modal */}
      {showAddExperience && (
        <AddExperienceModal
          onClose={() => setShowAddExperience(false)}
          onAdd={() => {
            setShowAddExperience(false);
            setExperienceTimestamp(Date.now());
          }}
        />
      )}
    </div>
  );
}

// Componentes inline para evitar imports faltando
function GamificationWidget({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🏆 Conquistas</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <i className="ri-close-line text-2xl"></i>
        </button>
      </div>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
              <i className="ri-restaurant-line text-white text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Foodie Iniciante</h3>
              <p className="text-sm text-gray-600">Registre 5 experiências</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletWidget({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">💰 Carteira</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <i className="ri-close-line text-2xl"></i>
        </button>
      </div>
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
        <p className="text-sm opacity-90 mb-2">Saldo Total</p>
        <h3 className="text-3xl font-bold">R$ 0,00</h3>
      </div>
    </div>
  );
}