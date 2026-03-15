import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyWinesTab from './components/MyWinesTab';

import StatsTab from './components/StatsTab';
import AddWineModal from './components/AddWineModal';
import SommelierTab from './components/SommelierTab';
import CellarIcon from '../../components/CellarIcon';
import CreateMenu from '../../components/CreateMenu';
import FloatingMenu from '../../components/FloatingMenu';
import NotificationsPanel from '../home/components/NotificationsPanel';
import HeaderActions from '../../components/HeaderActions';
import { useUnreadCounts } from '../../hooks/useUnreadCounts';
import CheckInModal from '../../components/CheckInModal';

import Header from '../../components/layout/Header';

export default function CellarPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-wines');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const { refreshCounts } = useUnreadCounts();

  const tabs = [
    { id: 'my-wines', label: 'Minha Adega', icon: 'custom' },

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

  const handleCreateOption = (option: 'post' | 'travel' | 'cellar' | 'food' | 'checkin') => {
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
      case 'checkin':
        setShowCheckIn(true);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pb-20 md:pb-0">
      {/* Top Header Global */}
      <Header onShowNotifications={() => setShowNotifications(true)} />

      {/* Cellar Title Area & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 mb-2 mt-4">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="border-l-4 border-blue-600 pl-4">
                <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
                  Minha Adega
                </h2>
                <p className="text-gray-500 font-medium mt-1">
                  Gerencie seus vinhos e acesse dicas do sommelier
                </p>
             </div>
             
             <div className="flex items-center gap-3 self-start md:self-auto">
               <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                 {tabs.map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     title={tab.label}
                     className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                       activeTab === tab.id 
                         ? 'bg-purple-50 text-purple-600 shadow-sm' 
                         : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                     }`}
                   >
                     {tab.icon === 'custom' ? (
                       <CellarIcon className="w-5 h-5" />
                     ) : (
                       <i className={`${tab.icon} text-xl`}></i>
                     )}
                   </button>
                 ))}
               </div>
               
               {activeTab === 'my-wines' && (
                 <button
                   onClick={() => setShowAddModal(true)}
                   title="Adicionar Vinho"
                   className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow hover:shadow-lg transition-all"
                 >
                   <i className="ri-add-line text-xl"></i>
                 </button>
               )}
             </div>
         </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 pb-24 md:pt-6">
        {activeTab === 'my-wines' && <MyWinesTab key={refreshKey} searchQuery="" onAddWine={() => setShowAddModal(true)} />}

        {activeTab === 'sommelier' && <SommelierTab />}
        {activeTab === 'stats' && <StatsTab />}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="flex items-center justify-around px-2 py-2 sm:py-3">
          <button
            onClick={() => handleBottomNavClick('feed')}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-colors text-gray-600"
          >
            <i className="ri-home-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Início</span>
          </button>

          <button
            onClick={() => setActiveTab('sommelier')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-colors ${activeTab === 'sommelier' ? 'text-purple-600' : 'text-gray-600'
              }`}
          >
            <i className={`ri-lightbulb-line text-xl sm:text-2xl ${activeTab === 'sommelier' ? 'text-purple-600' : ''
              }`}></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Sommelier</span>
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

          {/* New Add Wine Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
          >
            <CellarIcon className="w-6 h-6 text-gray-600" />
            <span className="text-[9px] sm:text-[10px] font-medium">Adicionar</span>
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
        <AddWineModal
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            setShowAddModal(false);
            setRefreshKey(prev => prev + 1);
          }}
        />
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

      {/* Check-In Modal */}
      {showCheckIn && <CheckInModal onClose={() => setShowCheckIn(false)} />}

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onRefresh={refreshCounts}
        />
      )}
    </div>
  );
}
