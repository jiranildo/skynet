import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AISearchTab from './components/AISearchTab';
import CreateTripModal from './components/CreateTripModal';
import FlightsTab from './components/FlightsTab';
import HotelsTab from './components/HotelsTab';
import PackagesTab from './components/PackagesTab';
import CarsTab from './components/CarsTab';
import CruisesTab from './components/CruisesTab';
import TicketsTab from './components/TicketsTab';
import TransferTab from './components/TransferTab';
import InsuranceTab from './components/InsuranceTab';
import MyTripsTab from './components/MyTripsTab';
import FavoritesTab from './components/FavoritesTab';
import OffersTab from './components/OffersTab';
import MarketplaceTab from './components/MarketplaceTab';
import BlogsTab from './components/BlogsTab';

import CreateMenu from '../../components/CreateMenu';
import CreatePostModal from '../home/components/CreatePostModal';
import NotificationsPanel from '../home/components/NotificationsPanel';
import GamificationWidget from '../../components/GamificationWidget';
import WalletWidget from '../../components/WalletWidget';
import HeaderActions from '../../components/HeaderActions';
import { useUnreadCounts } from '../../hooks/useUnreadCounts';
import CheckInModal from '../../components/CheckInModal';

type TabType = 'search' | 'ai-search' | 'flights' | 'hotels' | 'packages' | 'cars' | 'cruises' | 'tickets' | 'transfer' | 'insurance' | 'mytrips' | 'favorites' | 'offers' | 'marketplace' | 'blogs';

export default function TravelPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('mytrips');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['ai-search', 'flights', 'hotels', 'packages', 'cars', 'cruises', 'tickets', 'transfer', 'insurance', 'mytrips', 'favorites', 'offers', 'marketplace', 'blogs'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [location.search]);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [mytripsSubTab, setMytripsSubTab] = useState<string>('trips');
  const { refreshCounts } = useUnreadCounts();

  const tabs = [
    { id: 'mytrips', label: 'Minhas Viagens', icon: 'ri-compass-3-line' },
    { id: 'marketplace', label: 'Marketplace', icon: 'ri-store-line' },
    { id: 'flights', label: 'Voos', icon: 'ri-flight-takeoff-line' },
    { id: 'hotels', label: 'Hotéis', icon: 'ri-hotel-line' },
    { id: 'packages', label: 'Pacotes', icon: 'ri-suitcase-line' },
    { id: 'cars', label: 'Carros', icon: 'ri-car-line' },
    { id: 'cruises', label: 'Cruzeiros', icon: 'ri-ship-line' },
    { id: 'tickets', label: 'Ingressos', icon: 'ri-ticket-line' },
    { id: 'transfer', label: 'Transfer', icon: 'ri-taxi-line' },
    { id: 'insurance', label: 'Seguro', icon: 'ri-shield-check-line' },
    { id: 'favorites', label: 'Favoritos', icon: 'ri-heart-line' },
    { id: 'offers', label: 'Ofertas', icon: 'ri-price-tag-3-line' },
  ];

  const menuItems = [
    { icon: 'ri-article-line', label: 'Blogs', action: () => setActiveTab('blogs') },
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
      setActiveTab('mytrips');
    } else if (option === 'cellar') {
      window.REACT_APP_NAVIGATE('/cellar');
    } else if (option === 'food') {
      window.REACT_APP_NAVIGATE('/drinks-food');
    } else if (option === 'checkin') {
      setShowCheckIn(true);
    }
  };

  const handleExploreClick = () => {
    setActiveTab('mytrips');
  };

  const renderTabContent = () => {
    switch (activeTab) {

      case 'ai-search': return <AISearchTab />;
      case 'flights': return <FlightsTab />;
      case 'hotels': return <HotelsTab />;
      case 'packages': return <PackagesTab />;
      case 'cars': return <CarsTab />;
      case 'cruises': return <CruisesTab />;
      case 'tickets': return <TicketsTab />;
      case 'transfer': return <TransferTab />;
      case 'insurance': return <InsuranceTab />;
      case 'mytrips': return <MyTripsTab initialSubTab={mytripsSubTab} onCreateTrip={() => setShowCreateTripModal(true)} />;
      case 'favorites': return <FavoritesTab />;
      case 'offers': return <OffersTab />;
      case 'marketplace': return <MarketplaceTab />;
      case 'blogs': return <BlogsTab />;
      default: return <MyTripsTab initialSubTab={mytripsSubTab} onCreateTrip={() => setShowCreateTripModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="hover:scale-110 transition-transform"
            >
              <div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Travel Experience
                </h1>
                <p className="text-xs text-gray-500 italic">where travels come true.</p>
              </div>
            </button>
            <HeaderActions
              onShowNotifications={() => setShowNotifications(!showNotifications)}
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
            <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-4 md:p-6 text-white">
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
                  src="https://readdy.ai/api/search-image?query=professional%20portrait%20young%20person%20confident%20smile%20travel%20enthusiast&width=60&height=60&seq=menu-user&orientation=squarish"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">Você</h3>
                  <p className="text-white/90 text-xs md:text-sm">Viajante Nível 5</p>
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
                  className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
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
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 text-center">
                <i className="ri-information-line text-2xl md:text-3xl text-orange-500 mb-2"></i>
                <p className="text-xs md:text-sm text-gray-700 mb-1">SocialHub v1.0</p>
                <p className="text-xs text-gray-500">Sua plataforma de viagens</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tabs Carousel */}
      <div className="fixed top-[57px] left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  if (tab.id === 'mytrips') {
                    setMytripsSubTab('trips');
                  }
                }}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs md:text-sm ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <i className={`${tab.icon} text-base md:text-lg ${activeTab === tab.id
                  ? ''
                  : tab.id === 'search' ? 'text-orange-500' :
                    tab.id === 'mytrips' ? 'text-teal-500' :
                      tab.id === 'blogs' ? 'text-purple-500' :
                        tab.id === 'marketplace' ? 'text-emerald-500' :
                          tab.id === 'flights' ? 'text-blue-500' :
                            tab.id === 'hotels' ? 'text-pink-500' :
                              tab.id === 'packages' ? 'text-purple-500' :
                                tab.id === 'cars' ? 'text-red-500' :
                                  tab.id === 'cruises' ? 'text-cyan-500' :
                                    tab.id === 'tickets' ? 'text-yellow-500' :
                                      tab.id === 'transfer' ? 'text-green-500' :
                                        tab.id === 'insurance' ? 'text-indigo-500' :
                                          tab.id === 'favorites' ? 'text-rose-500' :
                                            tab.id === 'offers' ? 'text-amber-500' : ''
                  }`}></i>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-[112px] md:pt-[73px] pb-32 md:pb-6">
        <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          {renderTabContent()}
        </div>
      </div>

      <CreateTripModal
        isOpen={showCreateTripModal}
        onClose={() => setShowCreateTripModal(false)}
      />

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
            onClick={() => {
              setActiveTab('mytrips');
              setMytripsSubTab('newtrip');
            }}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <i className="ri-add-box-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Nova Viagem</span>
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
                        setActiveTab('marketplace');
                        setShowMenuDropdown(false);
                      }}
                      className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Marketplace"
                    >
                      <i className="ri-store-2-fill text-white text-base"></i>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('blogs');
                        setShowMenuDropdown(false);
                      }}
                      className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Blogs"
                    >
                      <i className="ri-article-fill text-white text-base"></i>
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

      {/* Check-In Modal */}
      {showCheckIn && <CheckInModal onClose={() => setShowCheckIn(false)} />}

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
