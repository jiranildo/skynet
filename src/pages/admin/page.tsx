import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNav from '../home/components/MobileNav';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'business' | 'admin';
  verified: boolean;
  joinedAt: string;
  stats: {
    posts: number;
    trips: number;
    followers: number;
    following: number;
    travelMoney: number;
    level: number;
  };
  status: 'active' | 'suspended' | 'banned';
}

interface MarketplaceItem {
  id: string;
  title: string;
  seller: {
    id: string;
    name: string;
  };
  price: number;
  sales: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Report {
  id: string;
  type: 'user' | 'post' | 'marketplace' | 'trip';
  targetId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalTrips: number;
  totalMarketplaceItems: number;
  totalRevenue: number;
  pendingReports: number;
  pendingApprovals: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'marketplace' | 'reports' | 'analytics' | 'settings'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalTrips: 0,
    totalMarketplaceItems: 0,
    totalRevenue: 0,
    pendingReports: 0,
    pendingApprovals: 0
  });
  // const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'business' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else {
        loadData();
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const loadData = () => {
    // Carregar usuários mockados
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20smiling%20friendly&width=100&height=100&seq=user1&orientation=squarish',
        role: 'user',
        verified: true,
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          posts: 45,
          trips: 12,
          followers: 234,
          following: 189,
          travelMoney: 1250,
          level: 8
        },
        status: 'active'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@email.com',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20friendly&width=100&height=100&seq=user2&orientation=squarish',
        role: 'business',
        verified: true,
        joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          posts: 89,
          trips: 25,
          followers: 1234,
          following: 456,
          travelMoney: 5670,
          level: 15
        },
        status: 'active'
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@email.com',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20smiling%20confident&width=100&height=100&seq=user3&orientation=squarish',
        role: 'user',
        verified: false,
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          posts: 12,
          trips: 3,
          followers: 45,
          following: 67,
          travelMoney: 320,
          level: 3
        },
        status: 'active'
      },
      {
        id: '4',
        name: 'Ana Oliveira',
        email: 'ana@email.com',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20elegant&width=100&height=100&seq=user4&orientation=squarish',
        role: 'business',
        verified: true,
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          posts: 156,
          trips: 42,
          followers: 3456,
          following: 234,
          travelMoney: 12340,
          level: 22
        },
        status: 'active'
      },
      {
        id: '5',
        name: 'Carlos Mendes',
        email: 'carlos@email.com',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20serious%20business&width=100&height=100&seq=user5&orientation=squarish',
        role: 'user',
        verified: false,
        joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          posts: 5,
          trips: 1,
          followers: 12,
          following: 34,
          travelMoney: 150,
          level: 1
        },
        status: 'suspended'
      }
    ];

    setUsers(mockUsers);

    // Carregar itens do marketplace
    const savedMarketplace = localStorage.getItem('marketplace-items');
    if (savedMarketplace) {
      const items = JSON.parse(savedMarketplace);
      setMarketplaceItems(items.map((item: any) => ({
        id: item.id,
        title: item.title,
        seller: {
          id: item.seller.id,
          name: item.seller.name
        },
        price: item.price,
        sales: item.sales,
        status: item.status || 'approved',
        createdAt: item.createdAt
      })));
    }

    // Carregar reports mockados
    const mockReports: Report[] = [
      {
        id: '1',
        type: 'post',
        targetId: 'post-123',
        reportedBy: 'João Silva',
        reason: 'Conteúdo inapropriado',
        description: 'Post contém linguagem ofensiva',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'user',
        targetId: 'user-456',
        reportedBy: 'Maria Santos',
        reason: 'Spam',
        description: 'Usuário enviando mensagens não solicitadas',
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];

    setReports(mockReports);

    // Calcular estatísticas
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.status === 'active').length;
    const totalPosts = mockUsers.reduce((sum, u) => sum + u.stats.posts, 0);
    const totalTrips = mockUsers.reduce((sum, u) => sum + u.stats.trips, 0);
    const totalMarketplaceItems = savedMarketplace ? JSON.parse(savedMarketplace).length : 0;
    const totalRevenue = mockUsers.reduce((sum, u) => sum + u.stats.travelMoney, 0);
    const pendingReports = mockReports.filter(r => r.status === 'pending').length;
    const pendingApprovals = 0;

    setStats({
      totalUsers,
      activeUsers,
      totalPosts,
      totalTrips,
      totalMarketplaceItems,
      totalRevenue,
      pendingReports,
      pendingApprovals
    });
  };

  const handleUserAction = (userId: string, action: 'verify' | 'suspend' | 'ban' | 'activate' | 'promote' | 'demote') => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'verify':
            return { ...user, verified: true };
          case 'suspend':
            return { ...user, status: 'suspended' as const };
          case 'ban':
            return { ...user, status: 'banned' as const };
          case 'activate':
            return { ...user, status: 'active' as const };
          case 'promote':
            return { ...user, role: user.role === 'user' ? 'business' as const : 'admin' as const };
          case 'demote':
            return { ...user, role: user.role === 'admin' ? 'business' as const : 'user' as const };
          default:
            return user;
        }
      }
      return user;
    });

    setUsers(updatedUsers);
    alert(`✅ Ação "${action}" executada com sucesso!`);
  };

  const handleMarketplaceAction = (itemId: string, action: 'approve' | 'reject' | 'remove') => {
    const updatedItems = marketplaceItems.map(item => {
      if (item.id === itemId) {
        switch (action) {
          case 'approve':
            return { ...item, status: 'approved' as const };
          case 'reject':
            return { ...item, status: 'rejected' as const };
          default:
            return item;
        }
      }
      return item;
    }).filter(item => action !== 'remove' || item.id !== itemId);

    setMarketplaceItems(updatedItems);
    alert(`✅ Item ${action === 'approve' ? 'aprovado' : action === 'reject' ? 'rejeitado' : 'removido'} com sucesso!`);
  };

  const handleReportAction = (reportId: string, action: 'resolve' | 'dismiss') => {
    const updatedReports = reports.map(report => {
      if (report.id === reportId) {
        return { ...report, status: action === 'resolve' ? 'resolved' as const : 'dismissed' as const };
      }
      return report;
    });

    setReports(updatedReports);
    alert(`✅ Denúncia ${action === 'resolve' ? 'resolvida' : 'descartada'} com sucesso!`);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { text: string; color: string; bg: string }> = {
      user: { text: 'Usuário', color: 'text-gray-700', bg: 'bg-gray-100' },
      business: { text: 'Business', color: 'text-purple-700', bg: 'bg-purple-100' },
      admin: { text: 'Admin', color: 'text-red-700', bg: 'bg-red-100' }
    };
    return badges[role] || badges.user;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string; bg: string }> = {
      active: { text: 'Ativo', color: 'text-green-700', bg: 'bg-green-100' },
      suspended: { text: 'Suspenso', color: 'text-orange-700', bg: 'bg-orange-100' },
      banned: { text: 'Banido', color: 'text-red-700', bg: 'bg-red-100' }
    };
    return badges[status] || badges.active;
  };

  const filteredUsers = users.filter(user => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterStatus !== 'all' && user.status !== filterStatus) return false;
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-shield-star-line text-lg md:text-2xl text-white"></i>
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent truncate">
                  Portal Admin
                </h1>
                <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Controle total da plataforma</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button className="px-2 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-1 md:gap-2">
                <i className="ri-notification-3-line text-base md:text-lg"></i>
                <span className="text-xs md:text-sm font-medium hidden sm:inline">Notificações</span>
                {stats.pendingReports > 0 && (
                  <span className="px-1.5 md:px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {stats.pendingReports}
                  </span>
                )}
              </button>
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/admin/login');
                }}
                className="px-2 md:px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-1 md:gap-2"
              >
                <i className="ri-logout-box-r-line text-base md:text-lg"></i>
                <span className="text-xs md:text-sm font-medium hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[57px] md:top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'dashboard' as const, label: 'Dashboard', icon: 'ri-dashboard-line' },
              { id: 'users' as const, label: 'Usuários', icon: 'ri-user-line' },
              { id: 'marketplace' as const, label: 'Marketplace', icon: 'ri-store-line' },
              { id: 'reports' as const, label: 'Denúncias', icon: 'ri-alarm-warning-line', badge: stats.pendingReports },
              { id: 'analytics' as const, label: 'Analytics', icon: 'ri-line-chart-line' },
              { id: 'settings' as const, label: 'Config', icon: 'ri-settings-line' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-4 border-b-2 transition-all whitespace-nowrap relative text-xs md:text-base ${activeTab === tab.id
                  ? 'border-red-500 text-red-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <i className={`${tab.icon} text-base md:text-lg`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 md:px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 md:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <i className="ri-user-line text-2xl md:text-4xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-bold">{stats.totalUsers}</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-medium mb-1">Total de Usuários</h3>
                <p className="text-white/70 text-xs">{stats.activeUsers} ativos</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <i className="ri-article-line text-2xl md:text-4xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-bold">{stats.totalPosts}</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-medium mb-1">Posts Publicados</h3>
                <p className="text-white/70 text-xs">Conteúdo gerado</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <i className="ri-flight-takeoff-line text-2xl md:text-4xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-bold">{stats.totalTrips}</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-medium mb-1">Viagens Criadas</h3>
                <p className="text-white/70 text-xs">Roteiros planejados</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <i className="ri-store-line text-2xl md:text-4xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-bold">{stats.totalMarketplaceItems}</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-medium mb-1">Itens Marketplace</h3>
                <p className="text-white/70 text-xs">Roteiros à venda</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <i className="ri-money-dollar-circle-line text-2xl md:text-4xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-bold">{stats.totalRevenue.toLocaleString()}</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-medium mb-1">Travel Money Total</h3>
                <p className="text-white/70 text-xs">Economia da plataforma</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <i className="ri-alarm-warning-line text-2xl md:text-4xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-bold">{stats.pendingReports}</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-medium mb-1">Denúncias Pendentes</h3>
                <p className="text-white/70 text-xs">Requer atenção</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <i className="ri-check-line text-2xl md:text-4xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-bold">{stats.pendingApprovals}</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-medium mb-1">Aprovações Pendentes</h3>
                <p className="text-white/70 text-xs">Marketplace</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <i className="ri-line-chart-line text-2xl md:text-4xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-bold">+24%</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-medium mb-1">Crescimento</h3>
                <p className="text-white/70 text-xs">Últimos 30 dias</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                <i className="ri-time-line text-red-500"></i>
                Atividade Recente
              </h2>
              <div className="space-y-3 md:space-y-4">
                {[
                  { icon: 'ri-user-add-line', color: 'text-green-500', text: 'Novo usuário registrado: Carlos Mendes', time: '5 min atrás' },
                  { icon: 'ri-store-line', color: 'text-purple-500', text: 'Novo roteiro publicado no Marketplace', time: '15 min atrás' },
                  { icon: 'ri-alarm-warning-line', color: 'text-red-500', text: 'Nova denúncia recebida', time: '2h atrás' },
                  { icon: 'ri-money-dollar-circle-line', color: 'text-yellow-500', text: 'Transação de 250 TM realizada', time: '3h atrás' },
                  { icon: 'ri-article-line', color: 'text-blue-500', text: '12 novos posts publicados', time: '5h atrás' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center ${activity.color} flex-shrink-0`}>
                      <i className={`${activity.icon} text-lg md:text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4 md:space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-3 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar usuários..."
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="all">Todas as Funções</option>
                  <option value="user">Usuário</option>
                  <option value="business">Business</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="suspended">Suspenso</option>
                  <option value="banned">Banido</option>
                </select>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Usuário</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Função</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estatísticas</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Membro desde</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const roleBadge = getRoleBadge(user.role);
                      const statusBadge = getStatusBadge(user.status);

                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex items-center gap-2 md:gap-3">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 md:gap-2">
                                  <h4 className="font-semibold text-gray-900 text-xs md:text-sm truncate">{user.name}</h4>
                                  {user.verified && (
                                    <i className="ri-verified-badge-fill text-blue-500 text-xs md:text-sm flex-shrink-0"></i>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span className={`px-2 md:px-3 py-1 ${roleBadge.bg} ${roleBadge.color} rounded-full text-xs font-medium whitespace-nowrap`}>
                              {roleBadge.text}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span className={`px-2 md:px-3 py-1 ${statusBadge.bg} ${statusBadge.color} rounded-full text-xs font-medium whitespace-nowrap`}>
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex flex-col gap-1 text-xs text-gray-600">
                              <span>📝 {user.stats.posts} posts</span>
                              <span>✈️ {user.stats.trips} viagens</span>
                              <span>💰 {user.stats.travelMoney} TM</span>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                              {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex items-center justify-end gap-1 md:gap-2">
                              {!user.verified && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'verify')}
                                  className="p-1.5 md:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Verificar"
                                >
                                  <i className="ri-verified-badge-line text-sm md:text-base"></i>
                                </button>
                              )}
                              {user.status === 'active' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                  className="p-1.5 md:p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                                  title="Suspender"
                                >
                                  <i className="ri-pause-circle-line text-sm md:text-base"></i>
                                </button>
                              )}
                              {user.status === 'suspended' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  className="p-1.5 md:p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Ativar"
                                >
                                  <i className="ri-play-circle-line text-sm md:text-base"></i>
                                </button>
                              )}
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'promote')}
                                  className="p-1.5 md:p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                  title="Promover"
                                >
                                  <i className="ri-arrow-up-circle-line text-sm md:text-base"></i>
                                </button>
                              )}
                              <button
                                onClick={() => handleUserAction(user.id, 'ban')}
                                className="p-1.5 md:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Banir"
                              >
                                <i className="ri-forbid-line text-sm md:text-base"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Roteiro</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendedor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Preço</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendas</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {marketplaceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{item.seller.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">{item.price} TM</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{item.sales}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {item.status === 'approved' ? 'Aprovado' : item.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleMarketplaceAction(item.id, 'approve')}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Aprovar"
                                >
                                  <i className="ri-check-line"></i>
                                </button>
                                <button
                                  onClick={() => handleMarketplaceAction(item.id, 'reject')}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Rejeitar"
                                >
                                  <i className="ri-close-line"></i>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleMarketplaceAction(item.id, 'remove')}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Remover"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                  <i className="ri-check-line text-4xl text-green-500"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma denúncia pendente</h3>
                <p className="text-gray-600">Tudo está funcionando perfeitamente! 🎉</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${report.status === 'pending' ? 'bg-red-100' :
                          report.status === 'resolved' ? 'bg-green-100' :
                            'bg-gray-100'
                          }`}>
                          <i className={`${report.type === 'user' ? 'ri-user-line' :
                            report.type === 'post' ? 'ri-article-line' :
                              report.type === 'marketplace' ? 'ri-store-line' :
                                'ri-map-pin-line'
                            } text-2xl ${report.status === 'pending' ? 'text-red-500' :
                              report.status === 'resolved' ? 'text-green-500' :
                                'text-gray-500'
                            }`}></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{report.reason}</h3>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Denunciado por: {report.reportedBy}</span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReportAction(report.id, 'resolve')}
                            className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                          >
                            Resolver
                          </button>
                          <button
                            onClick={() => handleReportAction(report.id, 'dismiss')}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            Descartar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                <i className="ri-line-chart-line text-4xl text-purple-500"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics em Desenvolvimento</h3>
              <p className="text-gray-600">Gráficos e relatórios detalhados em breve!</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                <i className="ri-settings-line text-4xl text-blue-500"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Configurações do Sistema</h3>
              <p className="text-gray-600">Painel de configurações em breve!</p>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNav
        activeTab="feed"
        onTabChange={(tab) => {
          if (tab === 'feed') window.REACT_APP_NAVIGATE('/');
          if (tab === 'explore') window.REACT_APP_NAVIGATE('/');
          if (tab === 'reels') window.REACT_APP_NAVIGATE('/');
        }}
        onCreateClick={() => window.REACT_APP_NAVIGATE('/')}
        onMenuClick={() => { }}
      />
    </div>
  );
}
