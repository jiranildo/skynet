
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import MessagesSidebar from './components/MessagesSidebar';
import ChatWindow from './components/ChatWindow';
import MobileNav from '../home/components/MobileNav';
import { useNavigate } from 'react-router-dom';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  // 'type' is needed to distinguish between DM, Group, Community for the ChatWindow
  const [selectedChatType, setSelectedChatType] = useState<'direct' | 'group' | 'community'>('direct');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const handleSelectChat = (id: string, type: 'direct' | 'group' | 'community') => {
    setSelectedChat(id);
    setSelectedChatType(type);
  };

  const handleMobileNavTabChange = (tab: 'feed' | 'explore' | 'reels') => {
    // Since we are in /messages, we need to navigate back to home
    // ideally passing the tab as state or query param if HomePage supports it.
    // For now, simple navigation.
    navigate('/');
  };

  if (!currentUser) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header handled by Sidebar for Desktop, or Mobile Header */}

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-60px)] md:h-screen pt-0 md:pt-0">

        {/* Sidebar: Visible on Desktop, or when no chat selected on mobile */}
        <div className={`
            w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col z-0
            ${selectedChat ? 'hidden md:flex' : 'flex'}
        `}>
          <MessagesSidebar
            currentUser={currentUser}
            selectedChatId={selectedChat}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Chat Window: Visible on Desktop, or when chat IS selected on mobile */}
        <div className={`
            flex-1 bg-white flex flex-col z-0
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
        <MobileNav
          activeTab="feed"
          onTabChange={handleMobileNavTabChange}
          onCreateClick={() => navigate('/')}
          onMenuClick={() => { }}
        />
      )}
    </div>
  );
}
