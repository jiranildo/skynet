import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, ensureUserProfile, updateUser } from '@/services/supabase';
import { EditProfileContent } from '@/pages/profile/components/EditProfileModal';
import { SettingsContent } from '@/pages/profile/components/SettingsModal';
import WalletWidget from '@/components/WalletWidget';
import GamificationWidget from '@/components/GamificationWidget';
import DocumentsContent from '../profile/components/DocumentsContent';
import TravelContent from '../profile/components/TravelContent';
import HealthContent from '../profile/components/HealthContent';
import HeaderActions from '@/components/HeaderActions';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import CreateMenu from '@/components/CreateMenu';
import CheckInModal from '@/components/CheckInModal';
import CreateStoryModal from '@/pages/home/components/CreateStoryModal';
import NotificationsPanel from '@/pages/home/components/NotificationsPanel';
import SaraSetupContent from './components/SaraSetupContent';

export default function SettingsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user: authUser, loading: authLoading } = useAuth();

    // Check if we are on mobile (viewport width check could be done via CSS/media query, 
    // but for logic we might want a simple check or just default to 'menu' if no tab provided)
    const isMobile = window.innerWidth < 768; // Simple initial check, react-responsive is better but avoiding deps

    // On mobile, default to no tab (menu view). On desktop, default to 'edit' or 'sara'.
    const activeTab = searchParams.get('tab');

    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { unreadMessages, unreadNotifications, refreshCounts } = useUnreadCounts();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMenuDropdown, setShowMenuDropdown] = useState(false);
    const [showGamification, setShowGamification] = useState(false);
    const [showWallet, setShowWallet] = useState(false);
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [createModalTab, setCreateModalTab] = useState<'POST' | 'STORY' | 'REEL' | 'TEMPLATES' | null>(null);
    const [editingPost, setEditingPost] = useState<any | null>(null);

    useEffect(() => {
        if (!authLoading && !authUser) {
            navigate('/login');
            return;
        }

        const loadProfile = async () => {
            try {
                const profile = await ensureUserProfile();
                setUserProfile(profile);
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (authUser) {
            loadProfile();
        }
    }, [authUser, authLoading, navigate]);

    const handleTabChange = (tabId: string) => {
        setSearchParams({ tab: tabId });
    };

    const handleUpdateProfile = (updatedUser: User) => {
        setUserProfile(updatedUser);
    };

    const handleBackToMenu = () => {
        setSearchParams({}); // Clear tab to go back to menu on mobile
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
            window.REACT_APP_NAVIGATE('/cellar');
        } else if (option === 'food') {
            window.REACT_APP_NAVIGATE('/drinks-food');
        } else if (option === 'checkin') {
            setShowCheckIn(true);
        }
    };

    // Organized Groups
    const menuGroups = [
        {
            title: 'Inteligência',
            items: [
                {
                    id: 'sara',
                    label: 'SARA AI',
                    icon: 'ri-magic-line',
                    color: 'text-fuchsia-600',
                    bg: 'bg-fuchsia-100',
                    border: 'border-fuchsia-200',
                    gradient: 'from-fuchsia-50 to-fuchsia-100/50',
                    desc: 'Sua assistente pessoal'
                },
            ]
        },
        {
            title: 'Conta',
            items: [
                {
                    id: 'edit',
                    label: 'Editar Perfil',
                    icon: 'ri-user-edit-line',
                    color: 'text-blue-600',
                    bg: 'bg-blue-100',
                    border: 'border-blue-200',
                    gradient: 'from-blue-50 to-blue-100/50',
                    desc: 'Dados pessoais e bio'
                },
                {
                    id: 'settings',
                    label: 'Configurações',
                    icon: 'ri-settings-3-line',
                    color: 'text-gray-600',
                    bg: 'bg-gray-100',
                    border: 'border-gray-200',
                    gradient: 'from-gray-50 to-gray-100/50',
                    desc: 'Preferências do app'
                },
                {
                    id: 'wallet',
                    label: 'Carteira',
                    icon: 'ri-wallet-3-line',
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-100',
                    border: 'border-yellow-200',
                    gradient: 'from-yellow-50 to-yellow-100/50',
                    desc: 'Pagamentos e cartões'
                },
            ]
        },
        {
            title: 'Vida & Bem-Estar',
            items: [
                {
                    id: 'travel',
                    label: 'Viagens',
                    icon: 'ri-plane-line',
                    color: 'text-orange-600',
                    bg: 'bg-orange-100',
                    border: 'border-orange-200',
                    gradient: 'from-orange-50 to-orange-100/50',
                    desc: 'Passaportes e roteiros'
                },
                {
                    id: 'health',
                    label: 'Saúde',
                    icon: 'ri-heart-pulse-line',
                    color: 'text-red-600',
                    bg: 'bg-red-100',
                    border: 'border-red-200',
                    gradient: 'from-red-50 to-red-100/50',
                    desc: 'Dados médicos e seguro'
                },
                {
                    id: 'documents',
                    label: 'Documentos',
                    icon: 'ri-file-user-line',
                    color: 'text-green-600',
                    bg: 'bg-green-100',
                    border: 'border-green-200',
                    gradient: 'from-green-50 to-green-100/50',
                    desc: 'Docs digitalizados'
                },
                {
                    id: 'gamification',
                    label: 'Conquistas',
                    icon: 'ri-trophy-line',
                    color: 'text-purple-600',
                    bg: 'bg-purple-100',
                    border: 'border-purple-200',
                    gradient: 'from-purple-50 to-purple-100/50',
                    desc: 'Nível e medalhas'
                },
            ]
        }
    ];

    // Flatten for easy lookup
    const allItems = menuGroups.flatMap(g => g.items);
    const activeItem = allItems.find(i => i.id === activeTab) || menuGroups[1].items[0]; // Default to Edit Profile if not found

    if (isLoading || !userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
            </div>
        );
    }

    // Determine current view for Mobile
    const showMobileMenu = !activeTab;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header - Mobile Only */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
                <div className="px-3 sm:px-4 md:px-6 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.REACT_APP_NAVIGATE('/')}
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

            <div className="flex-1 max-w-7xl mx-auto w-full p-0 md:p-6 lg:p-8 pt-[57px] md:pt-6 lg:pt-8">
                <div className="bg-white md:rounded-3xl shadow-sm md:shadow-xl w-full min-h-screen md:min-h-[85vh] overflow-hidden flex flex-col md:flex-row border-gray-100 md:border">

                    {/* Sidebar (Desktop) */}
                    <div className={`
                        ${showMobileMenu ? 'flex' : 'hidden'} 
                        md:flex w-full md:w-80 bg-white md:bg-gray-50/50 md:border-r border-gray-100 flex-col
                    `}>
                        <div className="p-6 md:p-8 pb-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 text-sm font-medium"
                            >
                                <i className="ri-arrow-left-line"></i>
                                Voltar ao Perfil
                            </button>
                            <h2 className="font-bold text-3xl font-heading text-gray-900 tracking-tight">Meu Espaço</h2>
                            <p className="text-sm text-gray-500 mt-1">Central de controle pessoal</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
                            {menuGroups.map((group, groupIdx) => (
                                <div key={groupIdx}>
                                    <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{group.title}</h3>
                                    <div className="space-y-1">
                                        {group.items.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleTabChange(item.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group text-left border mb-2 ${activeTab === item.id
                                                    ? `bg-gradient-to-br ${item.gradient} ${item.border} shadow-md scale-[1.02] -translate-y-0.5`
                                                    : `bg-white border-transparent hover:border-gray-100 hover:bg-gray-50/50`
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${activeTab === item.id
                                                    ? `${item.bg} shadow-sm`
                                                    : `bg-gray-50 group-hover:${item.bg}`
                                                    }`}>
                                                    <i className={`${item.icon} text-lg transition-colors duration-300 ${activeTab === item.id || 'group-hover:' + item.color ? item.color : 'text-gray-400'
                                                        }`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className={`block font-extrabold text-sm tracking-tight ${activeTab === item.id ? 'text-gray-900' : 'text-gray-700'
                                                        }`}>
                                                        {item.label}
                                                    </span>
                                                    <span className={`block text-[10px] uppercase font-bold tracking-wider ${activeTab === item.id ? item.color : 'text-gray-400'
                                                        }`}>
                                                        {item.desc}
                                                    </span>
                                                </div>
                                                {activeTab === item.id ? (
                                                    <div className={`w-1.5 h-6 rounded-full ${item.bg.replace('bg-', 'bg-').split('-')[1] === 'gray' ? 'bg-gray-400' : item.color.replace('text-', 'bg-')} opacity-50`}></div>
                                                ) : (
                                                    <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-gray-400 transition-colors"></i>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 md:p-6 text-center text-xs text-gray-300 border-t border-gray-100 md:border-none">
                            Skynet v2.4.0 • Build 2026.01
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className={`
                        flex-1 bg-white relative flex flex-col h-full overflow-hidden transition-opacity duration-300
                        ${showMobileMenu ? 'hidden md:flex' : 'flex'}
                    `}>
                        {/* Mobile Header for Content */}
                        <div className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center gap-4 z-20">
                            <button onClick={handleBackToMenu} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 active:scale-95 transition-transform">
                                <i className="ri-arrow-left-line text-lg"></i>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeItem.bg}`}>
                                    <i className={`${activeItem.icon} ${activeItem.color}`}></i>
                                </div>
                                <h1 className="font-bold text-lg text-gray-900">{activeItem.label}</h1>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto w-full">
                            {activeTab === 'sara' && (
                                <div className="h-full">
                                    <SaraSetupContent
                                        userProfile={userProfile}
                                        onUpdate={handleUpdateProfile}
                                    />
                                </div>
                            )}

                            {(!activeTab || activeTab === 'edit') && (
                                <div className="max-w-3xl mx-auto p-4 md:p-10 pb-24 md:pb-10">
                                    <div className="mb-8 md:hidden">
                                        <p className="text-sm text-gray-500">Mantenha seu perfil atualizado</p>
                                    </div>
                                    <EditProfileContent
                                        userProfile={userProfile}
                                        onUpdate={handleUpdateProfile}
                                        isEmbedded={true}
                                    />
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <SettingsContent
                                    userProfile={userProfile}
                                    onUpdate={handleUpdateProfile}
                                    onClose={() => { }}
                                    isEmbedded={true}
                                />
                            )}

                            {activeTab === 'wallet' && (
                                <div className="h-full min-h-[500px]">
                                    <WalletWidget onClose={() => { }} />
                                </div>
                            )}

                            {activeTab === 'gamification' && (
                                <div className="h-full min-h-[500px]">
                                    <GamificationWidget onClose={() => { }} />
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="p-4 md:p-8">
                                    <DocumentsContent userProfile={userProfile} isEmbedded={true} />
                                </div>
                            )}

                            {activeTab === 'travel' && (
                                <div className="p-4 md:p-8">
                                    <TravelContent userProfile={userProfile} isEmbedded={true} />
                                </div>
                            )}

                            {activeTab === 'health' && (
                                <div className="p-4 md:p-8">
                                    <HealthContent userProfile={userProfile} isEmbedded={true} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
                <div className="flex items-center justify-around px-2 py-2 sm:py-3">
                    <button
                        onClick={() => window.REACT_APP_NAVIGATE('/')}
                        className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
                    >
                        <i className="ri-home-line text-xl sm:text-2xl"></i>
                        <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Início</span>
                    </button>

                    <button
                        onClick={() => window.REACT_APP_NAVIGATE('/explore')}
                        className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
                    >
                        <i className="ri-compass-line text-xl sm:text-2xl"></i>
                        <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Explorar</span>
                    </button>

                    <button
                        onClick={handleCreateClick}
                        className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <i className="ri-add-line text-xl sm:text-2xl text-white"></i>
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Criar</span>
                    </button>

                    <button
                        onClick={() => window.REACT_APP_NAVIGATE('/reels')}
                        className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
                    >
                        <i className="ri-movie-line text-xl sm:text-2xl"></i>
                        <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">Reels</span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                            className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-purple-600"
                        >
                            <i className="ri-menu-fill text-xl sm:text-2xl"></i>
                            <span className="text-[9px] sm:text-[10px] font-medium">Menu</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showMenuDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-[70]"
                                    onClick={() => setShowMenuDropdown(false)}
                                ></div>
                                <div className="absolute bottom-full right-0 mb-2 w-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[80] animate-slideUp">
                                    <div className="flex flex-col gap-2 p-3">
                                        <button
                                            onClick={() => {
                                                window.REACT_APP_NAVIGATE('/travel?tab=marketplace');
                                                setShowMenuDropdown(false);
                                            }}
                                            className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                            title="Marketplace"
                                        >
                                            <i className="ri-store-2-fill text-white text-base"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowWallet(true);
                                                setShowMenuDropdown(false);
                                            }}
                                            className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                            title="Carteira"
                                        >
                                            <i className="ri-wallet-3-fill text-white text-base"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowGamification(true);
                                                setShowMenuDropdown(false);
                                            }}
                                            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                            title="Conquistas"
                                        >
                                            <i className="ri-trophy-fill text-white text-base"></i>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Global Modals */}
            {showNotifications && (
                <NotificationsPanel
                    onClose={() => setShowNotifications(false)}
                    onRefresh={refreshCounts}
                />
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
        </div>
    );
}
