import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ensureUserProfile, User as UserType } from '@/services/supabase';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import { isUserAdmin, isUserAgent as checkIsAgent, isUserSupplier as checkIsSupplier, isUserSuperAdmin as checkIsSuperAdmin } from '@/services/authz';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    onNotificationsClick?: () => void;
    onCreateClick?: () => void;
    onCreatePostClick?: () => void;
    onWalletClick?: () => void;
    onGamificationClick?: () => void;
    onCheckInClick?: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({
    onNotificationsClick,
    onCreateClick,
    onCreatePostClick,
    onWalletClick,
    onGamificationClick,
    onCheckInClick,
    isCollapsed,
    onToggleCollapse
}: SidebarProps) {
    const [userProfile, setUserProfile] = useState<UserType | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAgent, setIsAgent] = useState(false);
    const [isSupplier, setIsSupplier] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const { unreadMessages, unreadNotifications } = useUnreadCounts();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut, themeConfig } = useAuth();

    useEffect(() => {
        const loadProfile = async () => {
            if (user) {
                try {
                    const profile = await ensureUserProfile();
                    setUserProfile(profile);

                    const [adminStatus, agentStatus, supplierStatus, superAdminStatus] = await Promise.all([
                        isUserAdmin(user),
                        checkIsAgent(user),
                        checkIsSupplier(user),
                        checkIsSuperAdmin(user)
                    ]);
                    setIsAdmin(adminStatus);
                    setIsAgent(agentStatus);
                    setIsSupplier(supplierStatus);
                    setIsSuperAdmin(superAdminStatus);
                } catch (error) {
                    console.error("Error loading sidebar data:", error);
                }
            }
        };
        loadProfile();
    }, [user]);

    const initials = userProfile?.full_name
        ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0].toUpperCase() || 'U';

    const menuItems = [
        { id: 'home', label: 'Início', icon: 'home', path: '/' },
        { id: 'travel', label: 'Viagens', icon: 'flight-takeoff', path: '/travel' },
        { id: 'drinks-food', label: 'Drinks & Food', icon: 'restaurant-2', path: '/drinks-food' },
        { id: 'cellar', label: 'Minha Adega', icon: 'goblet', path: '/cellar' },
        { id: 'messages', label: 'Mensagens', icon: 'message-3', path: '/messages', badge: unreadMessages },
        { id: 'settings', label: 'Meu Espaço', icon: 'settings-4', path: '/settings' },
    ];

    if (isAgent || isAdmin) {
        menuItems.push({ id: 'agent', label: 'Portal do Agente', icon: 'briefcase', path: '/agent' });
    }

    if (isSupplier || isAdmin) {
        menuItems.push({ id: 'supplier', label: 'Painel do Fornecedor', icon: 'store-2', path: '/supplier' });
    }



    if (isAdmin) {
        menuItems.push({ id: 'admin', label: 'Administração', icon: 'shield-star', path: '/admin' });
    }

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo & Toggle */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <button
                        onClick={() => navigate('/')}
                        className="hover:scale-105 transition-transform text-left"
                    >
                        {themeConfig?.logo_url ? (
                            <img src={themeConfig.logo_url} alt="Logo" className="w-auto h-8 object-contain" />
                        ) : (
                            <h1 className="text-2xl font-black bg-gradient-to-r from-theme-primary via-pink-500 to-purple-600 bg-clip-text text-transparent">
                                SARA
                            </h1>
                        )}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Travel & Lifestyle</p>
                    </button>
                )}

                <button
                    onClick={onToggleCollapse}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all ${isCollapsed ? '' : 'ml-auto'
                        }`}
                    title={isCollapsed ? 'Expandir' : 'Recolher'}
                >
                    <i className={`ri-arrow-${isCollapsed ? 'right' : 'left'}-s-line text-lg`}></i>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide">
                <div>
                    {!isCollapsed && (
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Menu Principal</p>
                    )}
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`w-full flex items-center rounded-2xl transition-all duration-300 group ${isCollapsed ? 'justify-center py-3' : 'gap-4 px-4 py-3'
                                            } ${isActive
                                                ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-200'
                                                : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110 relative`}>
                                            <i className={`ri-${item.icon}-${isActive ? 'fill' : 'line'} text-xl`}></i>
                                            {isCollapsed && item.badge && item.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <>
                                                <span className="font-semibold text-sm">{item.label}</span>
                                                {item.badge && item.badge > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>


                <div>
                    {!isCollapsed && (
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ações Rápidas</p>
                    )}
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={onCreatePostClick}
                                title={isCollapsed ? "Criar Post" : undefined}
                                className={`w-full flex items-center rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all group ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
                                    }`}
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                    <i className="ri-quill-pen-line text-lg text-gray-600"></i>
                                </div>
                                {!isCollapsed && <span className="text-sm">Criar Post</span>}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={onCheckInClick}
                                title={isCollapsed ? "Check In-Out" : undefined}
                                className={`w-full flex items-center rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all group ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
                                    }`}
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                    <i className="ri-map-pin-user-line text-lg text-gray-600"></i>
                                </div>
                                {!isCollapsed && <span className="text-sm">Check In-Out</span>}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/travel?tab=blogs')}
                                title={isCollapsed ? "Blog de Viagens" : undefined}
                                className={`w-full flex items-center rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all group ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
                                    }`}
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                    <i className="ri-article-line text-lg text-gray-600"></i>
                                </div>
                                {!isCollapsed && <span className="text-sm">Blog de Viagens</span>}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={onGamificationClick}
                                title={isCollapsed ? "Gameficação" : undefined}
                                className={`w-full flex items-center rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all group ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
                                    }`}
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                    <i className="ri-trophy-line text-lg text-gray-600"></i>
                                </div>
                                {!isCollapsed && <span className="text-sm">Gameficação</span>}
                            </button>
                        </li>
                        <div className="h-px bg-gray-100 my-2"></div>
                        <li>
                            <button
                                onClick={onNotificationsClick}
                                title={isCollapsed ? "Notificações" : undefined}
                                className={`w-full flex items-center rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all group ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
                                    }`}
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors relative">
                                    <i className="ri-notification-3-line text-lg text-gray-600"></i>
                                    {isCollapsed && unreadNotifications > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                                            {unreadNotifications}
                                        </span>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <>
                                        <span className="text-sm">Notificações</span>
                                        {unreadNotifications > 0 && (
                                            <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                                                {unreadNotifications}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={onWalletClick}
                                title={isCollapsed ? "Carteira" : undefined}
                                className={`w-full flex items-center rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all group ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
                                    }`}
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                    <i className="ri-wallet-line text-lg text-gray-600"></i>
                                </div>
                                {!isCollapsed && <span className="text-sm">Carteira</span>}
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* User Profile */}
            <div className={`p-4 border-t border-gray-50 ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
                <button
                    onClick={() => navigate('/profile')}
                    title={isCollapsed ? (userProfile?.full_name || user?.email?.split('@')[0]) : undefined}
                    className={`rounded-2xl hover:bg-gray-50 transition-all flex items-center text-left group ${isCollapsed ? 'p-2' : 'w-full p-3 gap-3'
                        }`}
                >
                    {userProfile?.avatar_url ? (
                        <img
                            src={userProfile.avatar_url}
                            alt="Profile"
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-orange-100 transition-all"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            {initials}
                        </div>
                    )}
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {userProfile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                            </p>
                            <p className="text-[10px] font-medium text-gray-400 truncate uppercase tracking-tight">
                                {isSuperAdmin ? 'Super Administrador' : isAgent ? 'Agente Parceiro' : isAdmin ? 'Administrador' : 'Membro Premium'}
                            </p>
                        </div>
                    )}
                    {!isCollapsed && <i className="ri-more-2-fill text-gray-300 group-hover:text-gray-600 transition-colors"></i>}
                </button>

                <button
                    onClick={async () => {
                        try {
                            await signOut();
                            navigate('/login');
                        } catch (error) {
                            console.error("Error signing out:", error);
                        }
                    }}
                    title={isCollapsed ? "Encerrar Sessão" : undefined}
                    className={`py-2 text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isCollapsed ? 'w-10' : 'w-full mt-2'
                        }`}
                >
                    <i className="ri-logout-box-r-line text-lg"></i>
                    {!isCollapsed && <span>Encerrar Sessão</span>}
                </button>
            </div>
        </aside>
    );
}
