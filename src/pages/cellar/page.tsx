import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyWinesTab from './components/MyWinesTab';
import ExploreTab from './components/ExploreTab';
import StatsTab from './components/StatsTab';
import ScanBottleTab from './components/ScanBottleTab';
import AddWineModal from './components/AddWineModal';
import SommelierTab from './components/SommelierTab';
import CellarIcon from '../../components/CellarIcon';
import CreateMenu from '../../components/CreateMenu';
import FloatingMenu from '../../components/FloatingMenu';
import NotificationsPanel from '../home/components/NotificationsPanel';

export default function CellarPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-wines');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const tabs = [
    { id: 'my-wines', label: 'Minha Adega', icon: 'custom' },
    { id: 'explore', label: 'Explorar', icon: 'ri-compass-3-line' },
    { id: 'scan', label: 'Escanear', icon: 'ri-qr-scan-2-line' },
    { id: 'sommelier', label: 'Dicas do Sommelier', icon: 'ri-lightbulb-line' },
    { id: 'stats', label: 'Estatísticas', icon: 'ri-bar-chart-box-line' },
  ];

  const handleBottomNavClick = (action: string) => {
    switch (action) {
      case 'feed':
        navigate('/');
        break;
      case 'explore':
        setActiveTab('explore');
        break;
      case 'reels':
        navigate('/');
        break;
      case 'create':
        setShowCreateMenu(true);
        break;
      case 'menu':
        setShowFloatingMenu(true);
        break;
    }
  };

  const handleCreateOption = (option: 'post' | 'travel' | 'cellar' | 'food') => {
    setShowCreateMenu(false);

    switch (option) {
      case 'post':
        navigate('/');
        break;
      case 'travel':
        navigate('/travel');
        break;
      case 'cellar':
        // Quando já está na página de adega, abre a aba "Minha Adega"
        setActiveTab('my-wines');
        break;
      case 'food':
        navigate('/drinks-food');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="hover:scale-110 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Minha Adega
                  </h1>
                  <p className="text-xs text-gray-500">Gerencie sua coleção de vinhos</p>
                </div>
              </div>
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
                onClick={() => navigate('/messages')}
                className="relative hover:scale-110 transition-transform"
              >
                <i className="ri-message-3-line text-xl md:text-2xl text-gray-700"></i>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-white text-[10px] flex items-center justify-center font-medium">
                  2
                </span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="relative hover:scale-110 transition-transform"
              >
                <i className="ri-user-line text-xl md:text-2xl text-gray-700"></i>
              </button>

              {activeTab === 'my-wines' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium whitespace-nowrap ml-2"
                >
                  <i className="ri-add-line text-lg"></i>
                  Adicionar Vinho
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-purple-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === tab.id
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-500 border-transparent hover:text-purple-600'
                  }`}
              >
                {tab.icon === 'custom' ? (
                  <CellarIcon className="w-5 h-5" />
                ) : (
                  <i className={`${tab.icon} text-lg`}></i>
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-[128px] md:pt-6">
        {activeTab === 'my-wines' && <MyWinesTab searchQuery="" onAddWine={() => setShowAddModal(true)} />}
        {activeTab === 'explore' && <ExploreTab />}
        {activeTab === 'scan' && <ScanBottleTab />}
        {activeTab === 'sommelier' && <SommelierTab />}
        {activeTab === 'stats' && <StatsTab />}
      </div>

      {/* Floating Add Button (Mobile) */}
      {activeTab === 'my-wines' && (
        <button
          onClick={() => setShowAddModal(true)}
          className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-30"
        >
          <i className="ri-add-line text-2xl"></i>
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="flex items-center justify-around px-2 py-2 sm:py-3">
          <button
            onClick={() => handleBottomNavClick('feed')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-colors text-gray-600"
          >
            <i className="ri-home-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Início</span>
          </button>

          <button
            onClick={() => handleBottomNavClick('explore')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-colors text-gray-600"
          >
            <i className="ri-compass-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Explorar</span>
          </button>

          <button
            onClick={() => handleBottomNavClick('create')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <i className="ri-add-line text-xl sm:text-2xl text-white"></i>
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium">Criar</span>
          </button>

          <button
            onClick={() => setActiveTab('scan')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-colors text-gray-600"
          >
            <i className="ri-qr-scan-2-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Escanear</span>
          </button>

          <button
            onClick={() => handleBottomNavClick('menu')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <i className="ri-menu-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Add Wine Modal */}
      {showAddModal && (
        <AddWineModal onClose={() => setShowAddModal(false)} onAdd={() => setShowAddModal(false)} />
      )}

      {/* Create Menu */}
      {showCreateMenu && (
        <CreateMenu
          onClose={() => setShowCreateMenu(false)}
          onSelectOption={handleCreateOption}
        />
      )}

      {/* Floating Menu */}
      {showFloatingMenu && (
        <FloatingMenu />
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
