import { useState, useEffect } from 'react';
import MessagesSidebar from './components/MessagesSidebar';
import ChatWindow from './components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import HeaderActions from '../../components/HeaderActions';
import NotificationsPanel from '../home/components/NotificationsPanel';
import GamificationWidget from '../../components/GamificationWidget';
import WalletWidget from '../../components/WalletWidget';
import CreateMenu from '../../components/CreateMenu';
import CheckInModal from '../../components/CheckInModal';
import CreateStoryModal from '../home/components/CreateStoryModal';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  // 'type' is needed to distinguish between DM, Group, Community for the ChatWindow
  const [selectedChatType, setSelectedChatType] = useState<'direct' | 'group' | 'community'>('direct');
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { refreshCounts } = useUnreadCounts();

  // Standard UI States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<'POST' | 'STORY' | 'REEL' | 'TEMPLATES' | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'reels' | 'messages'>('messages');
  const [editingPost, setEditingPost] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSelectChat = (id: string, type: 'direct' | 'group' | 'community') => {
    setSelectedChat(id);
    setSelectedChatType(type);
  };

  const handleMobileNavTabChange = (tab: any) => {
    if (tab === 'messages') return;
    navigate('/');
  };

  const handleCreateClick = () => {
    setShowCreateMenu(true);
  };

  const handleCreateOption = (option: string) => {
    if (option === 'post') setCreateModalTab('POST');
    if (option === 'reel') setCreateModalTab('REEL');
    if (option === 'story') setCreateModalTab('STORY');

    if (option === 'travel') {
      window.REACT_APP_NAVIGATE('/travel');
    } else if (option === 'cellar') {
      setShowCreateMenu(false);
      window.REACT_APP_NAVIGATE('/cellar');
    } else if (option === 'food') {
      window.REACT_APP_NAVIGATE('/drinks-food');
    } else if (option === 'checkin') {
      setShowCheckIn(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[57px] md:pt-0">
      {/* Header - Mobile Only */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
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

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-130px)] md:h-screen">

        {/* Sidebar: Visible on Desktop, or when no chat selected on mobile */}
        <div className={`
            w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col
            ${selectedChat ? 'hidden md:flex' : 'flex'}
        `}>
          <MessagesSidebar
            currentUser={user}
            selectedChatId={selectedChat}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Chat Window: Visible on Desktop, or when chat IS selected on mobile */}
        <div className={`
            flex-1 bg-white flex flex-col
            ${!selectedChat ? 'hidden md:flex' : 'flex'}
        `}>
          {selectedChat ? (
            <ChatWindow
              chatId={selectedChat}
              type={selectedChatType}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-message-3-line text-4xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Suas Mensagens</h3>
              <p>Selecione uma conversa ou inicie uma nova para começar a falar.</p>
            </div>
          )}
        </div>

      </div>

      {!selectedChat && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
          <div className="flex items-center justify-around px-2 py-2 sm:py-3">
            <button
              onClick={() => navigate('/')}
              className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 ${activeTab === 'feed' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              <i className={`ri-home-${activeTab === 'feed' ? 'fill' : 'line'} text-xl sm:text-2xl`}></i>
              <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Início</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 ${activeTab === 'explore' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              <i className={`ri-compass-${activeTab === 'explore' ? 'fill' : 'line'} text-xl sm:text-2xl`}></i>
              <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Explorar</span>
            </button>

            <button
              onClick={handleCreateClick}
              className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="ri-add-line text-xl sm:text-2xl text-white"></i>
              </div>
            </button>

            <button
              onClick={() => navigate('/')}
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

              {showMenuDropdown && (
                <>
                  <div className="fixed inset-0 z-[70]" onClick={() => setShowMenuDropdown(false)}></div>
                  <div className="absolute bottom-full right-0 mb-2 w-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[80]">
                    <div className="flex flex-col gap-2 p-3">
                      <button
                        onClick={() => {
                          window.REACT_APP_NAVIGATE('/travel?tab=marketplace');
                          setShowMenuDropdown(false);
                        }}
                        className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <i className="ri-store-2-fill text-white"></i>
                      </button>
                      <button
                        onClick={() => {
                          setShowWallet(true);
                          setShowMenuDropdown(false);
                        }}
                        className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <i className="ri-wallet-3-fill text-white"></i>
                      </button>
                      <button
                        onClick={() => {
                          setShowGamification(true);
                          setShowMenuDropdown(false);
                        }}
                        className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <i className="ri-trophy-fill text-white"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Global Modals */}
      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onRefresh={refreshCounts}
        />
      )}

      {showGamification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowGamification(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <GamificationWidget onClose={() => setShowGamification(false)} />
          </div>
        </div>
      )}

      {showWallet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowWallet(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <WalletWidget onClose={() => setShowWallet(false)} />
          </div>
        </div>
      )}

      {showCreateMenu && (
        <CreateMenu
          onClose={() => setShowCreateMenu(false)}
          onSelectOption={handleCreateOption}
        />
      )}

      {showCheckIn && (
        <CheckInModal onClose={() => setShowCheckIn(false)} />
      )}

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
    </div>
  );
}
