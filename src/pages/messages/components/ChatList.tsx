import { useState, useEffect } from 'react';
import { getConversationsWithDetails, supabase } from '@/services/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatListProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
}

export default function ChatList({ selectedChat, onSelectChat }: ChatListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups' | 'communities'>('all');
  const [showNewChat, setShowNewChat] = useState(false);

  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const data = await getConversationsWithDetails(user.id);
          setConversations(data);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    loadConversations();
  }, []);

  const filteredChats = activeTab === 'all'
    ? conversations
    : conversations.filter(chat => {
      // For now, assume all DB chats are 'direct' until we implement group/community columns
      if (activeTab === 'direct') return true;
      return false;
    });

  const getTypeIcon = (type: string) => {
    if (type === 'group') return 'ri-group-line';
    if (type === 'community') return 'ri-global-line';
    return '';
  };

  return (
    <div className="w-full flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Mensagens</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            <i className="ri-add-line text-xl text-white"></i>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar conversas..."
            className="w-full px-4 py-2.5 pl-10 bg-gray-100 rounded-xl text-sm outline-none focus:bg-gray-200 transition-colors"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <i className="ri-search-line text-gray-500"></i>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'all'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Todas
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'direct'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Diretas
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'groups'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Grupos
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'communities'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Comunidades
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedChat === chat.id ? 'bg-gray-100' : ''
              }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img
                  src={chat.otherUser?.avatar_url || `https://readdy.ai/api/search-image?query=portrait&width=100&height=100&seq=chat-${chat.id}`}
                  alt={chat.otherUser?.username}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online status not yet in DB, hidden for now */}

            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-semibold text-sm truncate">{chat.otherUser?.full_name || chat.otherUser?.username}</span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {chat.last_message_at ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true, locale: ptBR }) : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate text-gray-500`}>
                  {chat.last_message}
                </p>
                {/* Unread count logic to be added */}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowNewChat(false)}
          ></div>
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Nova Conversa</h3>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  className="w-full px-4 py-2.5 pl-10 bg-gray-100 rounded-xl text-sm outline-none focus:bg-gray-200"
                />
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                  <i className="ri-group-line text-white"></i>
                </div>
                <span className="font-medium">Criar Grupo</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <i className="ri-global-line text-white"></i>
                </div>
                <span className="font-medium">Criar Comunidade</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
