import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ensureUserProfile, User as UserType } from '@/services/supabase';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface SidebarProps {
    onNotificationsClick?: () => void;
    onCreateClick?: () => void;
    onCreatePostClick?: () => void;
    onWalletClick?: () => void;
    onGamificationClick?: () => void;
    onSkynetExplorerClick?: () => void;
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
    onSkynetExplorerClick,
    onCheckInClick,
    isCollapsed,
    onToggleCollapse
}: SidebarProps) {
    const { user, signOut, themeConfig, hasPermission, isAdmin, isAgent, isSupplier, isSuperAdmin } = useAuth();
    const [userProfile, setUserProfile] = useState<UserType | null>(null);
    const [isReordering, setIsReordering] = useState(false);

    const { unreadMessages, unreadNotifications } = useUnreadCounts();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Define all possible Menu Items
    const baseMenuItems = useMemo(() => {
        const items: any[] = [
            { id: 'home', label: 'Início', icon: 'home', path: '/' },
        ];

        if (hasPermission('can_access_travel')) {
            items.push({ id: 'travel', label: 'Viagens', icon: 'flight-takeoff', path: '/travel' });
        }
        if (hasPermission('can_access_marketplace')) {
            items.push({ id: 'marketplace', label: 'Marketplace', icon: 'store-2', path: '/marketplace' });
        }
        if (hasPermission('can_access_drinks_food')) {
            items.push({ id: 'drinks-food', label: 'Drinks & Food', icon: 'restaurant-2', path: '/drinks-food' });
        }
        if (hasPermission('can_access_cellar')) {
            items.push({ id: 'cellar', label: 'Minha Adega', icon: 'goblet', path: '/cellar' });
        }
        if (hasPermission('can_access_messages')) {
            items.push({ id: 'messages', label: 'Mensagens', icon: 'message-3', path: '/messages', badge: unreadMessages });
        }
        if (hasPermission('can_access_sara_ai')) {
            items.push({
                id: 'sara-ai', label: 'SARA AI', icon: 'shining-2', path: '#ai', action: () => {
                    // This will be handled by a global event or common state if possible
                    // For now, let's just make it a visual entry if needed
                    window.dispatchEvent(new CustomEvent('toggle-sara-ai'));
                }
            });
        }

        return items;
    }, [unreadMessages, hasPermission]);

    const roleMenuItems = useMemo(() => {
        const items = [];
        if (hasPermission('can_access_agent_portal')) {
            items.push({ id: 'agent', label: 'Portal do Agente', icon: 'briefcase', path: '/agent' });
        }
        if (hasPermission('can_access_services_portal')) {
            items.push({ id: 'supplier', label: 'Portal de Serviços', icon: 'store-2', path: '/supplier' });
        }
        if (hasPermission('can_access_admin')) {
            items.push({ id: 'admin', label: 'Administração', icon: 'shield-star', path: '/admin' });
        }
        return items;
    }, [hasPermission]);

    const allVisibleMenuItems = useMemo(() => [...baseMenuItems, ...roleMenuItems], [baseMenuItems, roleMenuItems]);

    const quickActionItems = useMemo(() => {
        const items = [];

        if (hasPermission('can_post_social')) {
            items.push({ id: 'create-post', label: 'Criar Post', icon: 'quill-pen', action: onCreatePostClick });
        }
        if (hasPermission('can_manage_checkins')) {
            items.push({ id: 'checkin', label: 'Check In-Out', icon: 'map-pin-user', action: onCheckInClick });
        }
        if (hasPermission('can_manage_blog')) {
            items.push({ id: 'blog', label: 'Blog de Viagens', icon: 'article', action: () => navigate('/travel?tab=blogs') });
        }
        if (hasPermission('can_access_gamification')) {
            items.push({ id: 'gamification', label: 'Gameficação', icon: 'trophy', action: onGamificationClick });
        }

        items.push({ id: 'notifications', label: 'Notificações', icon: 'notification-3', action: onNotificationsClick, badge: unreadNotifications });

        if (hasPermission('can_access_wallet')) {
            items.push({ id: 'wallet', label: 'Carteira', icon: 'wallet', action: onWalletClick });
        }
        if (hasPermission('can_access_play_explorer')) {
            items.push({ id: 'skynet-explorer', label: 'SARA Play Explorer', icon: 'gamepad-line', action: onSkynetExplorerClick });
        }
        if (hasPermission('can_customize_platform')) {
            items.push({ id: 'customize', label: 'Meu Espaço', icon: 'palette', action: () => navigate('/settings?tab=appearance') });
        }

        return items;
    }, [hasPermission, onCreatePostClick, onCheckInClick, navigate, onGamificationClick, onNotificationsClick, unreadNotifications, onWalletClick, onSkynetExplorerClick]);

    // Managed state for current order
    const [currentMenuItems, setCurrentMenuItems] = useState<any[]>([]);
    const [currentQuickActions, setCurrentQuickActions] = useState<any[]>([]);

    // Load and sync orders
    useEffect(() => {
        const savedMenuOrder = localStorage.getItem('socialhub_sidebar_menu_order');
        const menuOrder = savedMenuOrder ? JSON.parse(savedMenuOrder) : [];

        const sortedMenu = [...allVisibleMenuItems].sort((a, b) => {
            const indexA = menuOrder.indexOf(a.id);
            const indexB = menuOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        setCurrentMenuItems(sortedMenu);
    }, [allVisibleMenuItems]);

    useEffect(() => {
        const savedQuickOrder = localStorage.getItem('socialhub_sidebar_quick_order');
        const quickOrder = savedQuickOrder ? JSON.parse(savedQuickOrder) : [];

        const sortedQuick = [...quickActionItems].sort((a, b) => {
            const indexA = quickOrder.indexOf(a.id);
            const indexB = quickOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        setCurrentQuickActions(sortedQuick);
    }, [quickActionItems]);

    const handleReorderMenu = (newItems: any[]) => {
        setCurrentMenuItems(newItems);
        const newOrder = newItems.map(item => item.id);
        localStorage.setItem('socialhub_sidebar_menu_order', JSON.stringify(newOrder));
    };

    const handleReorderQuick = (newItems: any[]) => {
        setCurrentQuickActions(newItems);
        const newOrder = newItems.map(item => item.id);
        localStorage.setItem('socialhub_sidebar_quick_order', JSON.stringify(newOrder));
    };

    useEffect(() => {
        const loadProfile = async () => {
            if (user) {
                try {
                    const profile = await ensureUserProfile();
                    setUserProfile(profile);


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
                {/* Menu Principal */}
                <div>
                    {!isCollapsed && (
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Menu Principal</p>
                    )}
                    <Reorder.Group
                        axis="y"
                        values={currentMenuItems}
                        onReorder={handleReorderMenu}
                        className="space-y-1"
                    >
                        {currentMenuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <Reorder.Item
                                    key={item.id}
                                    value={item}
                                    dragListener={isReordering}
                                    className="relative list-none"
                                >
                                    <button
                                        onClick={() => {
                                            if (isReordering) return;
                                            if (item.action) {
                                                item.action();
                                            } else {
                                                navigate(item.path);
                                            }
                                        }}
                                        disabled={isReordering}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`w-full flex items-center rounded-2xl transition-all duration-300 group ${isCollapsed ? 'justify-center py-3' : 'gap-4 px-4 py-3'
                                            } ${isActive
                                                ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-200'
                                                : 'hover:bg-gray-50 text-gray-600'
                                            } ${isReordering ? 'border-2 border-dashed border-indigo-200 cursor-grab active:cursor-grabbing scale-95 opacity-80' : ''}`}
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110 relative">
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
                                        {isReordering && (
                                            <div className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity">
                                                <i className="ri-draggable text-lg"></i>
                                            </div>
                                        )}
                                    </button>
                                </Reorder.Item>
                            );
                        })}
                    </Reorder.Group>
                </div>

                {/* Ações Rápidas */}
                <div>
                    {!isCollapsed && (
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ações Rápidas</p>
                    )}
                    <Reorder.Group
                        axis="y"
                        values={currentQuickActions}
                        onReorder={handleReorderQuick}
                        className="space-y-1"
                    >
                        {currentQuickActions.map((item) => (
                            <Reorder.Item
                                key={item.id}
                                value={item}
                                dragListener={isReordering}
                                className="list-none"
                            >
                                <button
                                    onClick={() => !isReordering && item.action?.()}
                                    disabled={isReordering}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`w-full flex items-center rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all group ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
                                        } ${isReordering ? 'border border-dashed border-indigo-200 cursor-grab active:cursor-grabbing scale-95 opacity-80' : ''}`}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors relative">
                                        <i className={`ri-${item.icon}-${item.id === 'notifications' && item.badge && item.badge > 0 ? 'fill' : 'line'} text-lg text-gray-600`}></i>
                                        {item.badge && item.badge > 0 && (
                                            <span className={`absolute -top-1 -right-1 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white ${item.id === 'notifications' ? 'bg-orange-500' : 'bg-red-500'}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <>
                                            <span className="text-sm">{item.label}</span>
                                            {item.badge && item.badge > 0 && !isCollapsed && item.id !== 'notifications' && (
                                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {item.id === 'notifications' && item.badge && item.badge > 0 && !isCollapsed && (
                                                <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {isReordering && (
                                        <div className="ml-auto opacity-30 group-hover:opacity-70 transition-opacity">
                                            <i className="ri-draggable text-lg"></i>
                                        </div>
                                    )}
                                </button>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </nav>

            {/* Bottom Actions */}
            <div className="px-4 py-2 border-t border-gray-50">
                <button
                    onClick={() => setIsReordering(!isReordering)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isReordering ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-500'}`}
                >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isReordering ? 'bg-white/20' : 'bg-gray-50'}`}>
                        <i className={`${isReordering ? 'ri-check-line' : 'ri-equalizer-line'} text-lg`}></i>
                    </div>
                    {!isCollapsed && <span className="text-sm font-bold">{isReordering ? 'Salvar Ordem' : 'Ordenar Menu'}</span>}
                </button>
            </div>

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
