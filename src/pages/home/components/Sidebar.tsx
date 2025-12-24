
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationsPanel from './NotificationsPanel';

interface SidebarProps {
  onExploreClick?: () => void;
  onReelsClick?: () => void;
  onCreateClick?: () => void;
  activeTab?: 'feed' | 'explore';
  onTabChange?: (tab: 'feed' | 'explore') => void;
}

export default function Sidebar({ 
  onExploreClick, 
  onReelsClick, 
  onCreateClick,
  activeTab = 'feed',
  onTabChange = () => {}
}: SidebarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            SARA Travel
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => {
                  onTabChange('feed');
                  navigate('/');
                }}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
                  activeTab === 'feed'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`ri-home-${activeTab === 'feed' ? 'fill' : 'line'} text-2xl`}></i>
                </div>
                <span className="text-base">Início</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => {
                  onTabChange('explore');
                }}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
                  activeTab === 'explore'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`ri-compass-${activeTab === 'explore' ? 'fill' : 'line'} text-2xl`}></i>
                </div>
                <span className="text-base">Explorar</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                }}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-notification-3-line text-2xl"></i>
                </div>
                <span className="text-base">Notificações</span>
                <span className="ml-auto w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></span>
              </button>
            </li>

            <li>
              <button
                onClick={onCreateClick}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-add-box-line text-2xl"></i>
                </div>
                <span className="text-base">Criar</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-user-line text-2xl"></i>
                </div>
                <span className="text-base">Perfil</span>
              </button>
            </li>

            <li>
              <button
                onClick={onReelsClick}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-movie-line text-2xl"></i>
                </div>
                <span className="text-base">Reels</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/travel')}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-flight-takeoff-line text-2xl"></i>
                </div>
                <span className="text-base">Viagens</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/drinks-food')}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-restaurant-2-line text-2xl"></i>
                </div>
                <span className="text-base">Drinks & Food</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/cellar')}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-goblet-line text-2xl"></i>
                </div>
                <span className="text-base">Adega</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/messages')}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-message-3-line text-2xl"></i>
                </div>
                <span className="text-base">Mensagens</span>
                <span className="ml-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  3
                </span>
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/admin/login')}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-shield-star-line text-2xl"></i>
                </div>
                <span className="text-base">Portal Admin</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <button 
          onClick={() => navigate('/profile')}
          className="p-4 border-t border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              MS
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900">Maria Silva</p>
              <p className="text-xs text-gray-500">@mariasilva</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </div>
        </button>
      </aside>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
