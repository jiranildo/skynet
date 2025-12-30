
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationsPanel from './NotificationsPanel';
import { useAuth } from '../../../context/AuthContext';
import { ensureUserProfile, User as UserType } from '../../../services/supabase';
import { useUnreadCounts } from '../../../hooks/useUnreadCounts';

interface SidebarProps {
  onExploreClick?: () => void;
  onReelsClick?: () => void;
  onCreateClick?: () => void;
  activeTab?: 'feed' | 'explore' | 'reels';
  onTabChange?: (tab: 'feed' | 'explore' | 'reels') => void;
  onWalletClick?: () => void;
  onGamificationClick?: () => void;
}

export default function Sidebar({
  onExploreClick,
  onReelsClick,
  onCreateClick,
  activeTab = 'feed',
  onTabChange = () => { },
  onWalletClick,
  onGamificationClick
}: SidebarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const { unreadMessages, unreadNotifications, refreshCounts } = useUnreadCounts();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const profile = await ensureUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error("Error loading sidebar profile:", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

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
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${activeTab === 'feed'
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
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${activeTab === 'explore'
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
                {unreadNotifications > 0 && (
                  <span className="ml-auto w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></span>
                )}
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
                onClick={() => {
                  onTabChange('reels');
                  if (onReelsClick) onReelsClick();
                }}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${activeTab === 'reels'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                  : 'hover:bg-gray-50'
                  }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`ri-movie-${activeTab === 'reels' ? 'fill' : 'line'} text-2xl`}></i>
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
                onClick={() => navigate('/travel?tab=marketplace')}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-store-2-line text-2xl"></i>
                </div>
                <span className="text-base">Marketplace</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/travel?tab=blogs')}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-article-line text-2xl"></i>
                </div>
                <span className="text-base">Blogs</span>
              </button>
            </li>

            <li>
              <button
                onClick={onWalletClick}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-wallet-line text-2xl"></i>
                </div>
                <span className="text-base">Carteira</span>
              </button>
            </li>

            <li>
              <button
                onClick={onGamificationClick}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-trophy-line text-2xl"></i>
                </div>
                <span className="text-base">Conquistas</span>
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
                {unreadMessages > 0 && (
                  <span className="ml-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadMessages}
                  </span>
                )}
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

            <li>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    navigate('/login');
                  } catch (error) {
                    console.error("Error signing out:", error);
                  }
                }}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-all font-medium"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-logout-box-line text-2xl"></i>
                </div>
                <span className="text-base">Sair</span>
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
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
            )}
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userProfile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{userProfile?.username || user?.email?.split('@')[0] || 'usuario'}
              </p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </div>
        </button>
      </aside>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onRefresh={refreshCounts}
        />
      )}
    </>
  );
}
