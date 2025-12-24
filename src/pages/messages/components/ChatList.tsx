import { useState } from 'react';

interface ChatListProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
}

const chats = [
  {
    id: 'sarah',
    type: 'direct',
    name: 'Sarah Johnson',
    username: 'sarahjohnson',
    lastMessage: 'That sounds amazing! Let\'s do it 🎉',
    timestamp: '2m',
    unread: 2,
    online: true,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20friendly%20face%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-1&orientation=squarish'
  },
  {
    id: 'wine-lovers',
    type: 'group',
    name: 'Wine Lovers 🍷',
    members: 24,
    lastMessage: 'Alex: Alguém já experimentou o Malbec argentino?',
    timestamp: '5m',
    unread: 5,
    avatar: 'https://readdy.ai/api/search-image?query=elegant%20wine%20glasses%20red%20wine%20tasting%20sophisticated%20ambiance%20warm%20lighting&width=100&height=100&seq=group-wine-lovers&orientation=squarish'
  },
  {
    id: 'mike',
    type: 'direct',
    name: 'Mike Chen',
    username: 'mikechen',
    lastMessage: 'Thanks for sharing!',
    timestamp: '15m',
    unread: 0,
    online: true,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20confident%20smile%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-2&orientation=squarish'
  },
  {
    id: 'travel-community',
    type: 'community',
    name: 'Viajantes do Mundo 🌍',
    members: 1247,
    lastMessage: 'Maria: Dicas para viajar pela Europa em 2025?',
    timestamp: '30m',
    unread: 12,
    avatar: 'https://readdy.ai/api/search-image?query=world%20travel%20destinations%20iconic%20landmarks%20passport%20adventure%20map%20globe%20international%20tourism&width=100&height=100&seq=community-travel&orientation=squarish'
  },
  {
    id: 'emma',
    type: 'direct',
    name: 'Emma Wilson',
    username: 'emmawilson',
    lastMessage: 'See you tomorrow! 👋',
    timestamp: '1h',
    unread: 0,
    online: false,
    avatar: 'https://readdy.ai/api/search-image?query=young%20woman%20portrait%20happy%20expression%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-3&orientation=squarish'
  },
  {
    id: 'food-group',
    type: 'group',
    name: 'Gastronomia & Drinks',
    members: 18,
    lastMessage: 'Carlos: Receita de coquetel para o fim de semana?',
    timestamp: '2h',
    unread: 0,
    avatar: 'https://readdy.ai/api/search-image?query=gourmet%20food%20plating%20cocktails%20fine%20dining%20culinary%20art%20elegant%20presentation&width=100&height=100&seq=group-food&orientation=squarish'
  },
  {
    id: 'alex',
    type: 'direct',
    name: 'Alex Rodriguez',
    username: 'alexrodriguez',
    lastMessage: 'Perfect! I\'ll send you the details',
    timestamp: '3h',
    unread: 0,
    online: false,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20person%20portrait%20friendly%20smile%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-4&orientation=squarish'
  },
  {
    id: 'cellar-community',
    type: 'community',
    name: 'Colecionadores de Vinhos 🍾',
    members: 892,
    lastMessage: 'João: Como organizar uma adega pequena?',
    timestamp: '5h',
    unread: 0,
    avatar: 'https://readdy.ai/api/search-image?query=wine%20cellar%20collection%20bottles%20vintage%20wines%20storage%20elegant%20wooden%20racks%20sophisticated&width=100&height=100&seq=community-cellar&orientation=squarish'
  },
  {
    id: 'lisa',
    type: 'direct',
    name: 'Lisa Anderson',
    username: 'lisaanderson',
    lastMessage: 'Love this! 😍',
    timestamp: '1d',
    unread: 0,
    online: true,
    avatar: 'https://readdy.ai/api/search-image?query=woman%20portrait%20cheerful%20expression%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-5&orientation=squarish'
  }
];

export default function ChatList({ selectedChat, onSelectChat }: ChatListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups' | 'communities'>('all');
  const [showNewChat, setShowNewChat] = useState(false);

  const filteredChats = activeTab === 'all' 
    ? chats 
    : chats.filter(chat => {
        if (activeTab === 'direct') return chat.type === 'direct';
        if (activeTab === 'groups') return chat.type === 'group';
        if (activeTab === 'communities') return chat.type === 'community';
        return true;
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
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'direct'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Diretas
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'groups'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Grupos
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'communities'
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
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
              selectedChat === chat.id ? 'bg-gray-100' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {chat.type === 'direct' && chat.online && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
              {chat.type !== 'direct' && (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-r from-orange-500 to-pink-500 border-2 border-white rounded-full flex items-center justify-center">
                  <i className={`${getTypeIcon(chat.type)} text-xs text-white`}></i>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-semibold text-sm truncate">{chat.name}</span>
                  {chat.type !== 'direct' && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {chat.members} membros
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{chat.timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${chat.unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
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
