import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ensureUserProfile, User as UserType } from '@/services/supabase';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import { isUserAdmin, isUserAgent as checkIsAgent } from '@/services/authz';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    onNotificationsClick?: () => void;
    onCreateClick?: () => void;
    onWalletClick?: () => void;
    onGamificationClick?: () => void;
}

export default function Sidebar({
    onNotificationsClick,
    onCreateClick,
    onWalletClick,
    onGamificationClick
}: SidebarProps) {
    const [userProfile, setUserProfile] = useState<UserType | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAgent, setIsAgent] = useState(false);
    const { unreadMessages, unreadNotifications } = useUnreadCounts();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();

    useEffect(() => {
        const loadProfile = async () => {
            if (user) {
                try {
                    const profile = await ensureUserProfile();
                    setUserProfile(profile);

                    const [adminStatus, agentStatus] = await Promise.all([
                        isUserAdmin(user),
                        checkIsAgent(user)
                    ]);
                    setIsAdmin(adminStatus);
                    setIsAgent(agentStatus);
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
        { id: 'cellar', label: 'Adega', icon: 'goblet', path: '/cellar' },
        { id: 'messages', label: 'Mensagens', icon: 'message-3', path: '/messages', badge: unreadMessages },
        { id: 'settings', label: 'Meu Espaço', icon: 'settings-4', path: '/settings' },
    ];

    if (isAgent) {
        menuItems.push({ id: 'agent', label: 'Painel Agente', icon: 'briefcase', path: '/agent' });
    }

    if (isAdmin) {
        menuItems.push({ id: 'admin', label: 'Admin', icon: 'shield-star', path: '/admin' });
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
            {/* Logo */}
            <div className="p-8">
                <button
                    onClick={() => navigate('/')}
                    className="hover:scale-105 transition-transform text-left"
                >
                    <h1 className="text-2xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                        SARA
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Travel & Lifestyle</p>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-8">
                <div>
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Menu Principal</p>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-200'
                                            : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110`}>
                                            <i className={`ri-${item.icon}-${isActive ? 'fill' : 'line'} text-xl`}></i>
                                        </div>
                                        <span className="font-semibold text-sm">{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div>
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ações Rápidas</p>
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={onCreateClick}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-600 transition-all group"
                            >
                                <div className="w-6 h-6 flex items-center justify-center p-1 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg text-white shadow-sm group-hover:scale-110 transition-transform">
                                    <i className="ri-add-line text-lg"></i>
                                </div>
                                <span className="font-semibold text-sm">Criar Novo</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={onNotificationsClick}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-600 transition-all group"
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <i className="ri-notification-3-line text-xl group-hover:scale-110 transition-transform"></i>
                                </div>
                                <span className="font-semibold text-sm">Notificações</span>
                                {unreadNotifications > 0 && (
                                    <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={onWalletClick}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-600 transition-all group"
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <i className="ri-wallet-line text-xl group-hover:scale-110 transition-transform"></i>
                                </div>
                                <span className="font-semibold text-sm">Carteira</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={() => navigate('/profile')}
                    className="w-full p-3 rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-3 text-left group"
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
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {userProfile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 truncate uppercase tracking-tight">
                            {isAgent ? 'Agente Parceiro' : isAdmin ? 'Administrador' : 'Membro Premium'}
                        </p>
                    </div>
                    <i className="ri-more-2-fill text-gray-300 group-hover:text-gray-600 transition-colors"></i>
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
                    className="w-full mt-2 py-2 text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                    <i className="ri-logout-box-r-line"></i>
                    Encerrar Sessão
                </button>
            </div>
        </aside>
    );
}
