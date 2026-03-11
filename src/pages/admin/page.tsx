import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import MobileNav from '../home/components/MobileNav';
import { useAuth } from '../../context/AuthContext';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, type ManageUserPayload, getAdminEntities, createAdminEntity, updateAdminEntity, deleteAdminEntity, type ManageEntityPayload, getAdminMarketplaceItems, updateMarketplaceItemStatus, deleteAdminMarketplaceItem, type AdminMarketplaceItem, getAdminAnalytics } from '../../services/db/admin';
import { rolesService } from '../../services/db/roles';
import type { Role } from '../../services/db/types';
import AdminUserModal from './components/AdminUserModal';
import AdminEntityModal from './components/AdminEntityModal';
import AdminRoleModal from './components/AdminRoleModal';
import { AlertModal } from '../../components/AlertModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import type { User as DBUser, Entity as DBEntity, Experience } from '../../services/db/types';

type MarketplaceItem = AdminMarketplaceItem;

interface User {
  id: string;
  name: string;
  full_name?: string;
  username?: string;
  email: string;
  avatar: string;
  avatar_url?: string;
  role: DBUser['role'];
  role_id?: string;
  role_data?: any;
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
  entity_id?: string;
  creator?: {
    full_name?: string;
    username?: string;
  };
  entity?: {
    name?: string;
  };
}

// Interface duplicated, removing redundant one

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
  const { user, loading, signOut, hasPermission, isSuperAdmin } = useAuth();
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'entities' | 'marketplace' | 'reports' | 'analytics' | 'settings' | 'roles'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [entities, setEntities] = useState<DBEntity[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentUserRole, setCurrentUserRole] = useState<string>('viajante');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState<DBEntity | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'warning' | 'danger' });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, type: 'danger' as 'danger' | 'warning' | 'info' | 'success' });

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'info' | 'success' | 'warning' | 'danger' = 'danger') => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, type });
  };

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const validateAccess = async () => {
      if (loading) return;

      if (!user) {
        if (active) {
          setHasAdminAccess(false);
          setIsAdminChecked(true);
          navigate('/admin/login', { replace: true });
        }
        return;
      }

      const allowed = hasPermission('can_access_admin');
      if (!active) return;

      setHasAdminAccess(allowed);
      setIsAdminChecked(true);

      if (!allowed) {
        await signOut();
        navigate('/admin/login', { replace: true });
        return;
      }

      setCurrentUserRole(isSuperAdmin ? 'super_admin' : 'admin');

      loadData();
    };

    validateAccess();
    return () => {
      active = false;
    };
  }, [user, loading, navigate, signOut]);

  // Re-fetch analytics when days filter changes
  useEffect(() => {
    if (user && isAdminChecked && hasAdminAccess) {
      const isSuper = currentUserRole === 'super_admin';
      const entityId = user.user_metadata?.entity_id;
      fetchAnalytics(isSuper, entityId);
    }
  }, [analyticsDays, user, isAdminChecked, hasAdminAccess, currentUserRole]);

  if (loading || !isAdminChecked) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !hasAdminAccess) return null;

  async function loadData() {
    console.log('[loadData] Starting loadData...');
    let loadedUsers: User[] = [];
    let isSuper = false;
    let entityId = user?.user_metadata?.entity_id;

    try {
      console.log('[loadData] Calling getAdminUsers()');
      const dbUsers = await getAdminUsers();
      console.log('[loadData] Received dbUsers:', dbUsers.length);
      loadedUsers = dbUsers.map(u => ({
        id: u.id,
        name: u.full_name || u.username || 'Usuário',
        full_name: u.full_name,
        username: u.username,
        email: u.email || `@${u.username}`,
        avatar: u.avatar_url || 'https://readdy.ai/api/search-image?query=placeholder&width=100&height=100',
        role: u.role as any,
        verified: true,
        joinedAt: u.created_at || new Date().toISOString(),
        avatar_url: u.avatar_url,
        role_id: u.role_id,
        role_data: u.role_data,
        stats: {
          posts: u.posts_count || 0,
          trips: 0,
          followers: u.followers_count || 0,
          following: u.following_count || 0,
          travelMoney: 0,
          level: 1
        },
        status: (u.status as any) || 'active',
        entity_id: u.entity_id,
        creator: u.creator,
        entity: u.entity
      }));
      setUsers(loadedUsers);

      const isSuper = isSuperAdmin;
      if (!isSuper && !entityId) {
        const currentUserDb = dbUsers.find(u => u.id === user?.id);
        if (currentUserDb) {
          entityId = currentUserDb.entity_id;
        }
      }

      const dbEntities = await getAdminEntities(isSuper ? 'super_admin' : 'admin', entityId);
      setEntities(dbEntities);
    } catch (e) {
      console.error('[loadData] Failed to load data:', e);
    }

    try {
      const items = await getAdminMarketplaceItems();
      setMarketplaceItems(items);
    } catch (e) {
      console.error('Failed to load marketplace items:', e);
    }

    try {
      const dbRoles = await rolesService.getAll();
      setRoles(dbRoles);
    } catch (e) {
      console.error('Failed to load roles:', e);
    }

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

    fetchAnalytics(isSuper, entityId);
  }

  const fetchAnalytics = async (isSuperParam: boolean, entityIdParam?: string) => {
    try {
      setIsAnalyticsLoading(true);
      const data = await getAdminAnalytics(
        isSuperParam ? 'super_admin' : 'admin',
        entityIdParam,
        analyticsDays
      );

      setAnalyticsData(data);
      if (data) {
        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalPosts: data.totalPosts || 0,
          totalTrips: data.totalTrips || 0,
          totalMarketplaceItems: data.totalMarketplaceItems || 0,
          totalRevenue: data.totalRevenue || 0,
          pendingReports: 2, // From mock
          pendingApprovals: 0
        });
      }
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };


  const handleDeleteUser = async (userId: string) => {
    showConfirm('Confirmar Exclusão', 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.', async () => {
      try {
        await deleteAdminUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        showAlert('Sucesso', '✅ Usuário excluído com sucesso.', 'success');
      } catch (error: any) {
        showAlert('Erro', error.message || 'Erro ao excluir usuário.', 'danger');
      }
    });
  };

  const handleSaveUser = async (data: ManageUserPayload, isEdit: boolean) => {
    try {
      if (isEdit && userToEdit) {
        await updateAdminUser(userToEdit.id, data);
      } else {
        await createAdminUser(data);
      }
      loadData(); // refresh list
    } catch (error: any) {
      throw error; // Let modal handle it
    }
  };

  const handleSaveEntity = async (data: ManageEntityPayload, isEdit: boolean) => {
    try {
      if (isEdit && entityToEdit) {
        await updateAdminEntity(entityToEdit.id, data);
      } else {
        await createAdminEntity(data);
      }
      loadData(); // refresh list
    } catch (error: any) {
      throw error; // Let modal handle it
    }
  };

  const handleDeleteEntity = async (id: string) => {
    showConfirm('Confirmar Exclusão', 'Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.', async () => {
      try {
        await deleteAdminEntity(id);
        setEntities(prev => prev.filter(e => e.id !== id));
        showAlert('Sucesso', '✅ Empresa excluída com sucesso!', 'success');
      } catch (error: any) {
        showAlert('Erro', error.message || 'Erro ao excluir empresa.', 'danger');
      }
    });
  };

  const handleSaveRole = async (data: Partial<Role>, isEdit: boolean) => {
    try {
      if (isEdit && roleToEdit) {
        const updated = await rolesService.update(roleToEdit.id, data);
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
      } else {
        const created = await rolesService.create(data as Omit<Role, 'id' | 'created_at' | 'updated_at'>);
        setRoles(prev => [created, ...prev]);
      }
      showAlert('Sucesso', `✅ Perfil ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'success');
      setIsRoleModalOpen(false);
    } catch (error: any) {
      throw error; // Let modal handle it
    }
  };

  const handleDeleteRole = async (id: string) => {
    showConfirm('Confirmar Exclusão', 'Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.', async () => {
      try {
        await rolesService.delete(id);
        setRoles(prev => prev.filter(r => r.id !== id));
        showAlert('Sucesso', '✅ Perfil excluído com sucesso!', 'success');
      } catch (error: any) {
        showAlert('Erro', error.message || 'Erro ao excluir perfil.', 'danger');
      }
    });
  };

  const handleMarketplaceAction = async (itemId: string, itemType: 'trip' | 'experience', action: 'approve' | 'reject' | 'remove') => {
    try {
      if (action === 'remove') {
        showConfirm('Excluir Item', 'Tem certeza que deseja excluir este item do marketplace?', async () => {
          await deleteAdminMarketplaceItem(itemId, itemType);
          setMarketplaceItems(prev => prev.filter(item => item.id !== itemId));
          showAlert('Sucesso', '✅ Item removido com sucesso!', 'success');
        });
        return;
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await updateMarketplaceItemStatus(itemId, itemType, newStatus);

      setMarketplaceItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus as any } : item
      ));

      showAlert('Sucesso', `✅ Item ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`, 'success');
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao processar ação.', 'danger');
    }
  };

  const handleReportAction = (reportId: string, action: 'resolve' | 'dismiss') => {
    const updatedReports = reports.map(report => {
      if (report.id === reportId) {
        return { ...report, status: action === 'resolve' ? 'resolved' as const : 'dismissed' as const };
      }
      return report;
    });

    setReports(updatedReports);
    showAlert('Sucesso', `✅ Denúncia ${action === 'resolve' ? 'resolvida' : 'descartada'} com sucesso!`, 'success');
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { text: string; color: string; bg: string }> = {
      user: { text: 'Usuário', color: 'text-gray-700', bg: 'bg-gray-100' },
      viajante: { text: 'Role Básica (Free)', color: 'text-gray-700', bg: 'bg-gray-100' },
      business: { text: 'Business', color: 'text-purple-700', bg: 'bg-purple-100' },
      agente: { text: 'Agente', color: 'text-blue-700', bg: 'bg-blue-100' },
      fornecedor: { text: 'Fornecedor', color: 'text-orange-700', bg: 'bg-orange-100' },
      admin: { text: 'Admin', color: 'text-red-700', bg: 'bg-red-100' },
      super_admin: { text: 'Super Admin', color: 'text-rose-700', bg: 'bg-rose-100' },
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
              { id: 'roles' as const, label: 'Perfis', icon: 'ri-shield-keyhole-line' },
              { id: 'entities' as const, label: 'Empresas', icon: 'ri-building-4-line' },
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
              {[
                { label: 'Usuários', value: stats.totalUsers, sub: `${stats.activeUsers} ativos`, icon: 'ri-user-line', color: 'from-blue-500 to-cyan-500' },
                { label: 'Posts', value: stats.totalPosts, sub: 'Engajamento', icon: 'ri-article-line', color: 'from-green-500 to-emerald-500' },
                { label: 'Viagens', value: stats.totalTrips, sub: 'Roteiros', icon: 'ri-flight-takeoff-line', color: 'from-purple-500 to-pink-500' },
                { label: 'Marketplace', value: stats.totalMarketplaceItems, sub: 'Serviços/Roteiros', icon: 'ri-store-line', color: 'from-orange-500 to-pink-500' }
              ].map((card, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 md:p-6 text-white shadow-lg overflow-hidden relative group`}>
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <i className={`${card.icon} text-8xl md:text-9xl`}></i>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <i className={`${card.icon} text-2xl md:text-3xl opacity-80 shadow-sm`}></i>
                    <span className="text-xl md:text-3xl font-black">{card.value.toLocaleString()}</span>
                  </div>
                  <h3 className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">{card.label}</h3>
                  <p className="text-white/70 text-xs">{card.sub}</p>
                </div>
              ))}

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 md:p-6 text-white shadow-lg lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-money-dollar-circle-line text-2xl md:text-3xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-black">{stats.totalRevenue.toLocaleString()} TM</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Economia Gerada (Travel Money)</h3>
                <p className="text-white/80 text-xs">Volume total de transações na plataforma</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 md:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-alarm-warning-line text-2xl md:text-3xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-black">{stats.pendingReports}</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Denúncias Pendentes</h3>
                <p className="text-white/80 text-xs">Ação imediata recomendada</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-4 md:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-line-chart-line text-2xl md:text-3xl opacity-80"></i>
                  <span className="text-xl md:text-3xl font-black">+24%</span>
                </div>
                <h3 className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Crescimento Mensal</h3>
                <p className="text-white/80 text-xs">Novos usuários vs anterior</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Growth Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {currentUserRole === 'super_admin' ? 'Crescimento da Plataforma' : 'Crescimento da Base de Clientes'}
                    </h2>
                    <p className="text-xs text-gray-500">Acúmulo de novos usuários nos últimos {analyticsDays} dias</p>
                  </div>
                  <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                    {[1, 7, 30, 90, 365].map(d => (
                      <button
                        key={d}
                        onClick={() => setAnalyticsDays(d)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${analyticsDays === d ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData?.platformGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} minTickGap={30} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} width={30} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} width={40} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                      <Line yAxisId="left" type="monotone" dataKey="users" name="Usuários" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line yAxisId="left" type="monotone" dataKey="posts" name="Posts" stroke="#10b981" strokeWidth={3} dot={false} />
                      <Line yAxisId="left" type="monotone" dataKey="trips" name="Viagens" stroke="#3b82f6" strokeWidth={3} dot={false} />
                      <Line yAxisId="left" type="monotone" dataKey="marketplace" name="Marketplace" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                      <Line yAxisId="left" type="monotone" dataKey="entities" name="Empresas" stroke="#64748b" strokeWidth={3} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" name="Vol. Transacional (TM)" stroke="#f59e0b" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="ri-flashlight-line text-yellow-500"></i>
                  Atividade de Monitoramento
                </h2>
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
                  {(analyticsData?.recentActivity || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <i className="ri-inbox-line text-4xl mb-2"></i>
                      <p className="text-sm">Nenhuma atividade recente</p>
                    </div>
                  ) : (
                    (analyticsData?.recentActivity || []).map((activity: any, index: number) => {
                      // Format relative time (e.g., '2h', 'Agora')
                      const diffInMinutes = Math.floor((new Date().getTime() - new Date(activity.created_at).getTime()) / 60000);
                      let timeString = 'Agora';
                      if (diffInMinutes > 0 && diffInMinutes < 60) timeString = `${diffInMinutes}m`;
                      else if (diffInMinutes >= 60 && diffInMinutes < 1440) timeString = `${Math.floor(diffInMinutes / 60)}h`;
                      else if (diffInMinutes >= 1440) timeString = `${Math.floor(diffInMinutes / 1440)}d`;

                      return (
                        <div key={index} className="flex gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-default">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.color} flex-shrink-0 shadow-sm font-bold`}>
                            <i className={activity.icon}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-bold text-gray-900 truncate">{activity.action}</p>
                              <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">{timeString}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{activity.details}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="mt-6 w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  Ver Log Completo <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Análise de Performance</h2>
                <p className="text-sm text-gray-500">Dados detalhados dos últimos {analyticsDays} dias</p>
              </div>
              <div className="flex gap-2">
                {[30, 90, 365].map(d => (
                  <button
                    key={d}
                    onClick={() => setAnalyticsDays(d)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${analyticsDays === d ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {d} Dias
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Velocity Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Velocidade de Receita (TM)</h3>
                  <p className="text-xs text-gray-500">Comparativo entre Travel Money ganho vs gasto</p>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData?.revenueData || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="earned" name="Ganhos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spent" name="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Distribution Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Distribuição de Conteúdo</h3>
                  <p className="text-xs text-gray-500">Mix de produtos no marketplace por categoria</p>
                </div>
                <div className="h-[250px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Roteiros de Viagem', value: stats.totalTrips },
                          { name: 'Experiências/Serviços', value: stats.totalMarketplaceItems - stats.totalTrips }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#fca5a5" />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="hidden sm:block pl-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-xs font-bold text-gray-600">Roteiros Completo</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-300"></div>
                        <span className="text-xs font-bold text-gray-600">Serviços Avulsos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performer Sections */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="ri-medal-line text-yellow-500"></i>
                  Top Destinos em Alta
                </h3>
                <div className="space-y-4">
                  {['Paris, França', 'Maldivas', 'Toscana, Itália', 'Kioto, Japão'].map((dest, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-xs font-bold text-gray-300">#{idx + 1}</span>
                        <p className="text-sm font-bold text-gray-900">{dest}</p>
                      </div>
                      <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+{12 + idx * 5}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="ri-award-line text-blue-500"></i>
                  Maiores Fornecedores
                </h3>
                <div className="space-y-4">
                  {['Global Travels Inc', 'Elite Experiences', 'Nomad Adventures', 'Luxury Stay Group'].map((vendor, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-xs font-bold text-gray-300">#{idx + 1}</span>
                        <p className="text-sm font-bold text-gray-900">{vendor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">{3200 - idx * 400} TM</p>
                        <p className="text-[10px] text-gray-500">Volume Vendas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-between items-center bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-3 md:p-4">
              <h2 className="text-lg font-bold text-gray-900">Perfis de Acesso (Roles)</h2>
              <button
                onClick={() => {
                  setRoleToEdit(null);
                  setIsRoleModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
              >
                <i className="ri-add-line"></i> Novo Perfil
              </button>
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nome do Perfil</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Resumo de Permissões</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {roles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">Nenhum perfil encontrado.</td>
                      </tr>
                    ) : (
                      roles.map((role) => {
                        const permKeys = Object.keys(role.permissions || {}).filter(k => role.permissions[k]);
                        return (
                          <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 md:px-6 py-3 md:py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                                  <i className="ri-shield-keyhole-line"></i>
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{role.name}</span>
                              </div>
                            </td>
                            <td className="px-3 md:px-6 py-3 md:py-4">
                              <span className="text-sm text-gray-500">{role.description || '-'}</span>
                            </td>
                            <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                              {permKeys.length === 0 ? 'Nenhuma' : permKeys.length > 3 ? `${permKeys.slice(0, 3).map(k => k.replace('can_', '')).join(', ')} +${permKeys.length - 3}` : permKeys.map(k => k.replace('can_', '')).join(', ')}
                            </td>
                            <td className="px-3 md:px-6 py-3 md:py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setRoleToEdit(role);
                                    setIsRoleModalOpen(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar Perfil"
                                >
                                  <i className="ri-edit-line"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir Perfil"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-between items-center bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-3 md:p-4">
              <h2 className="text-lg font-bold text-gray-900">Gerenciamento de Usuários</h2>
              <button
                onClick={() => { setUserToEdit(null); setIsUserModalOpen(true); }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
              >
                <i className="ri-user-add-line"></i> Novo Usuário
              </button>
            </div>
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
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="all">Todas as Funções</option>
                  <option value="viajante">Viajante</option>
                  <option value="agente">Agente</option>
                  <option value="fornecedor">Fornecedor</option>
                  <option value="admin">Admin</option>
                  {currentUserRole === 'super_admin' && <option value="super_admin">Super Admin</option>}
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
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Empresa</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Criado por</th>
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
                                {user.username && !user.email.startsWith('@') && (
                                  <p className="text-[10px] text-gray-400 truncate">@{user.username}</p>
                                )}
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
                            <span className="text-xs md:text-sm text-gray-800 font-medium">
                              {user.entity?.name || '-'}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex flex-col">
                              <span className="text-xs md:text-sm text-gray-800 font-medium">
                                {user.creator?.full_name || '-'}
                              </span>
                              {user.creator?.username && (
                                <span className="text-xs text-gray-500">
                                  @{user.creator.username}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                              {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex items-center justify-end gap-1 md:gap-2">
                              {/* Edit Button */}
                              <button
                                onClick={() => { setUserToEdit(user); setIsUserModalOpen(true); }}
                                className="p-1.5 md:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Editar"
                              >
                                <i className="ri-edit-line text-sm md:text-base"></i>
                              </button>
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 md:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Excluir"
                              >
                                <i className="ri-delete-bin-line text-sm md:text-base"></i>
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

        {/* Entities Tab */}
        {activeTab === 'entities' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Empresas (Look & Feel)</h2>
              {currentUserRole === 'super_admin' && (
                <button
                  onClick={() => { setEntityToEdit(null); setIsEntityModalOpen(true); }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
                >
                  <i className="ri-add-line text-lg"></i>
                  Nova Empresa
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entities.map(entity => (
                <div key={entity.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-24 bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100 relative" style={{ backgroundColor: entity.theme_config?.primary_color || '#f97316' }}>
                    {entity.theme_config?.logo_url ? (
                      <img src={entity.theme_config.logo_url} alt={entity.name} className="max-h-16 max-w-full drop-shadow-md" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <i className="ri-building-4-fill text-3xl text-white"></i>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => { setEntityToEdit(entity); setIsEntityModalOpen(true); }}
                        className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition-all shadow-sm"
                        title="Personalizar Look & Feel"
                      >
                        <i className="ri-palette-line"></i>
                      </button>
                      {currentUserRole === 'super_admin' && (
                        <button
                          onClick={() => handleDeleteEntity(entity.id)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md text-white rounded-lg transition-all shadow-sm"
                          title="Excluir Empresa"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{entity.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium capitalize">
                        {entity.type === 'agency' ? 'Agência' : entity.type === 'supplier' ? 'Fornecedor' : 'Individual'}
                      </span>
                      <span className="text-xs text-gray-400">
                        Criado em {new Date(entity.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tema Aplicado:</p>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-xs text-gray-600">Cor Primária</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-gray-500">{entity.theme_config?.primary_color || '#f97316'}</code>
                          <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: entity.theme_config?.primary_color || '#f97316' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-3 md:p-4">
              <h2 className="text-lg font-bold text-gray-900">Gerenciamento do Marketplace</h2>
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Roteiro</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendedor</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Preço</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendas</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Período/Local</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {marketplaceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.cover_image}
                              alt={item.title}
                              className="w-12 h-10 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                              <p className={`text-[10px] font-bold uppercase ${item.item_type === 'trip' ? 'text-blue-600' : 'text-purple-600'}`}>
                                {item.item_type === 'trip' ? 'Roteiro' : item.category || 'Passeio'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.seller?.avatar_url || 'https://readdy.ai/api/search-image?query=placeholder&width=100&height=100'}
                              className="w-6 h-6 rounded-full object-cover"
                              alt=""
                            />
                            <span className="text-sm text-gray-700">{item.seller?.full_name || item.seller?.username || 'Vendedor'}</span>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className="font-bold text-gray-900 text-sm">
                            {item.price} {item.currency}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className="text-sm font-medium text-gray-600">
                            {item.sales} {item.sales === 1 ? 'venda' : 'vendas'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex flex-col gap-1">
                            {(item.start_date || item.end_date) ? (
                              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <i className="ri-calendar-line"></i>
                                <span>
                                  {item.start_date ? new Date(item.start_date).toLocaleDateString('pt-BR') : '...'} - {item.end_date ? new Date(item.end_date).toLocaleDateString('pt-BR') : '...'}
                                </span>
                              </div>
                            ) : null}
                            <div className="flex items-center gap-1 text-[11px] text-gray-600 font-medium">
                              <i className="ri-map-pin-line"></i>
                              <span>{item.destination || item.location || 'N/A'}</span>
                            </div>
                            <div className="mt-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.visibility === 'public' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                {item.visibility === 'public' ? 'PÚBLICO' : 'PRIVADO'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {item.status === 'approved' ? 'Aprovado' :
                              item.status === 'rejected' ? 'Reprovado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center justify-end gap-2">
                            {item.status !== 'approved' && (
                              <button
                                onClick={() => handleMarketplaceAction(item.id, item.item_type, 'approve')}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                title="Aprovar"
                              >
                                <i className="ri-check-line text-lg"></i>
                              </button>
                            )}
                            {item.status !== 'rejected' && (
                              <button
                                onClick={() => handleMarketplaceAction(item.id, item.item_type, 'reject')}
                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                                title="Reprovar"
                              >
                                <i className="ri-close-line text-lg"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleMarketplaceAction(item.id, item.item_type, 'remove')}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Remover"
                            >
                              <i className="ri-delete-bin-line text-lg"></i>
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

      {/* Modals */}
      {isUserModalOpen && (
        <AdminUserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSave={handleSaveUser}
          userToEdit={userToEdit as any}
          currentUserRole={currentUserRole}
          entities={entities}
          dbRoles={roles}
        />
      )}

      {isEntityModalOpen && (
        <AdminEntityModal
          isOpen={isEntityModalOpen}
          onClose={() => setIsEntityModalOpen(false)}
          onSave={handleSaveEntity}
          entityToEdit={entityToEdit}
          currentUserRole={currentUserRole}
        />
      )}

      {isRoleModalOpen && (
        <AdminRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSave={handleSaveRole}
          roleToEdit={roleToEdit}
        />
      )}

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
    </div>
  );
}
