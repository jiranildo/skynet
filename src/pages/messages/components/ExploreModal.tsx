import { useState } from 'react';

interface ExploreModalProps {
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  isFollowing: boolean;
  isOnline: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  avatar: string;
  category: string;
  isJoined: boolean;
}

export default function ExploreModal({ onClose }: ExploreModalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Ana Silva',
      username: '@anasilva',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20friendly%20natural%20light%20modern%20background%20casual%20business%20attire%20confident%20approachable%20warm%20expression%20high%20quality%20photography&width=200&height=200&seq=explore1&orientation=squarish',
      bio: 'Apaixonada por viagens e fotografia 📸✈️',
      followers: 2543,
      isFollowing: false,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Carlos Mendes',
      username: '@carlosm',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20smiling%20friendly%20natural%20light%20modern%20background%20casual%20business%20attire%20confident%20approachable%20warm%20expression%20high%20quality%20photography&width=200&height=200&seq=explore2&orientation=squarish',
      bio: 'Chef e amante da gastronomia 🍷🍽️',
      followers: 1876,
      isFollowing: false,
      isOnline: false,
    },
    {
      id: '3',
      name: 'Mariana Costa',
      username: '@maricoast',
      avatar: 'https://readdy.ai/api/search-image?query=young%20woman%20portrait%20smiling%20happy%20natural%20light%20outdoor%20background%20casual%20clothing%20friendly%20cheerful%20authentic%20expression%20high%20quality%20photography&width=200&height=200&seq=explore3&orientation=squarish',
      bio: 'Exploradora de culturas e sabores 🌍',
      followers: 3421,
      isFollowing: false,
      isOnline: true,
    },
    {
      id: '4',
      name: 'Pedro Santos',
      username: '@pedrosantos',
      avatar: 'https://readdy.ai/api/search-image?query=young%20man%20portrait%20smiling%20friendly%20natural%20light%20urban%20background%20casual%20style%20confident%20approachable%20genuine%20expression%20high%20quality%20photography&width=200&height=200&seq=explore4&orientation=squarish',
      bio: 'Aventureiro e fotógrafo de viagens 🏔️📷',
      followers: 4102,
      isFollowing: false,
      isOnline: true,
    },
    {
      id: '5',
      name: 'Julia Oliveira',
      username: '@juliaoliv',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20elegant%20natural%20light%20modern%20background%20stylish%20clothing%20confident%20friendly%20warm%20expression%20high%20quality%20photography&width=200&height=200&seq=explore5&orientation=squarish',
      bio: 'Food blogger e sommelier 🍷✨',
      followers: 5234,
      isFollowing: false,
      isOnline: false,
    },
    {
      id: '6',
      name: 'Rafael Lima',
      username: '@rafalima',
      avatar: 'https://readdy.ai/api/search-image?query=young%20man%20portrait%20smiling%20casual%20natural%20light%20outdoor%20background%20relaxed%20style%20friendly%20approachable%20authentic%20expression%20high%20quality%20photography&width=200&height=200&seq=explore6&orientation=squarish',
      bio: 'Viajante profissional e escritor ✈️📝',
      followers: 3876,
      isFollowing: false,
      isOnline: true,
    },
  ]);

  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Viajantes do Brasil',
      description: 'Compartilhe suas experiências de viagem pelo Brasil',
      members: 1243,
      avatar: 'https://readdy.ai/api/search-image?query=brazil%20travel%20group%20icon%20colorful%20vibrant%20tropical%20beach%20mountains%20diverse%20landscapes%20adventure%20tourism%20beautiful%20scenery%20high%20quality%20illustration&width=200&height=200&seq=group1&orientation=squarish',
      category: 'Viagens',
      isJoined: false,
    },
    {
      id: '2',
      name: 'Gastronomia Mundial',
      description: 'Descubra sabores e receitas de todo o mundo',
      members: 2156,
      avatar: 'https://readdy.ai/api/search-image?query=world%20cuisine%20food%20group%20icon%20colorful%20diverse%20dishes%20international%20gastronomy%20culinary%20art%20delicious%20meals%20high%20quality%20illustration&width=200&height=200&seq=group2&orientation=squarish',
      category: 'Gastronomia',
      isJoined: false,
    },
    {
      id: '3',
      name: 'Fotografia de Viagens',
      description: 'Compartilhe suas melhores fotos de viagem',
      members: 3421,
      avatar: 'https://readdy.ai/api/search-image?query=travel%20photography%20group%20icon%20camera%20beautiful%20landscapes%20adventure%20scenic%20views%20professional%20photography%20artistic%20composition%20high%20quality%20illustration&width=200&height=200&seq=group3&orientation=squarish',
      category: 'Fotografia',
      isJoined: false,
    },
    {
      id: '4',
      name: 'Vinhos e Harmonização',
      description: 'Aprenda sobre vinhos e harmonizações perfeitas',
      members: 1876,
      avatar: 'https://readdy.ai/api/search-image?query=wine%20tasting%20group%20icon%20elegant%20wine%20glasses%20bottles%20vineyard%20sophisticated%20sommelier%20culture%20gourmet%20experience%20high%20quality%20illustration&width=200&height=200&seq=group4&orientation=squarish',
      category: 'Gastronomia',
      isJoined: false,
    },
    {
      id: '5',
      name: 'Mochileiros Aventureiros',
      description: 'Para quem ama viajar com pouco e viver muito',
      members: 2987,
      avatar: 'https://readdy.ai/api/search-image?query=backpacker%20adventure%20group%20icon%20hiking%20mountains%20camping%20outdoor%20exploration%20travel%20gear%20nature%20wilderness%20high%20quality%20illustration&width=200&height=200&seq=group5&orientation=squarish',
      category: 'Viagens',
      isJoined: false,
    },
    {
      id: '6',
      name: 'Chefs Caseiros',
      description: 'Receitas e dicas para cozinhar em casa',
      members: 4532,
      avatar: 'https://readdy.ai/api/search-image?query=home%20cooking%20group%20icon%20kitchen%20chef%20hat%20cooking%20utensils%20delicious%20homemade%20food%20culinary%20skills%20recipes%20high%20quality%20illustration&width=200&height=200&seq=group6&orientation=squarish',
      category: 'Gastronomia',
      isJoined: false,
    },
  ]);

  const handleFollowUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
    ));
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId ? { ...group, isJoined: !group.isJoined } : group
    ));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <i className="ri-compass-3-fill text-2xl text-white"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Explorar</h2>
                <p className="text-white/90 text-sm">Descubra pessoas e grupos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <i className="ri-close-line text-2xl text-white"></i>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pessoas ou grupos..."
              className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500 text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="ri-user-line mr-2"></i>
              Pessoas ({filteredUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'groups'
                  ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="ri-group-line mr-2"></i>
              Grupos ({filteredGroups.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{user.name}</h3>
                        {user.isOnline && (
                          <span className="text-xs text-green-600 font-medium">Online</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.username}</p>
                      <p className="text-sm text-gray-700 mt-1">{user.bio}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.followers.toLocaleString('pt-BR')} seguidores
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleFollowUser(user.id)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          user.isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {user.isFollowing ? 'Seguindo' : 'Seguir'}
                      </button>
                      <button
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                      >
                        <i className="ri-message-3-line mr-1"></i>
                        Mensagem
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="ri-user-search-line text-4xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-600">Nenhuma pessoa encontrada</p>
                  <p className="text-sm text-gray-500 mt-1">Tente buscar com outros termos</p>
                </div>
              )}
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-xl border-2 border-gray-200 hover:border-pink-300 transition-all overflow-hidden"
                  >
                    <div className="relative h-32">
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                          {group.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{group.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <i className="ri-group-line text-lg"></i>
                          <span className="text-sm">{group.members.toLocaleString('pt-BR')} membros</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          group.isJoined
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {group.isJoined ? (
                          <>
                            <i className="ri-check-line mr-1"></i>
                            Participando
                          </>
                        ) : (
                          <>
                            <i className="ri-add-line mr-1"></i>
                            Participar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="ri-group-line text-4xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-600">Nenhum grupo encontrado</p>
                  <p className="text-sm text-gray-500 mt-1">Tente buscar com outros termos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
