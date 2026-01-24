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

    // Organized Groups
    const menuGroups = [
        {
            title: 'Inteligência',
            items: [
                { id: 'sara', label: 'SARA AI', icon: 'ri-magic-line', color: 'text-fuchsia-500', bg: 'bg-fuchsia-50', desc: 'Sua assistente pessoal' },
            ]
        },
        {
            title: 'Conta',
            items: [
                { id: 'edit', label: 'Editar Perfil', icon: 'ri-user-edit-line', color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Dados pessoais e bio' },
                { id: 'settings', label: 'Configurações', icon: 'ri-settings-3-line', color: 'text-gray-500', bg: 'bg-gray-50', desc: 'Preferências do app' },
                { id: 'wallet', label: 'Carteira', icon: 'ri-wallet-3-line', color: 'text-yellow-500', bg: 'bg-yellow-50', desc: 'Pagamentos e cartões' },
            ]
        },
        {
            title: 'Vida & Bem-Estar',
            items: [
                { id: 'travel', label: 'Viagens', icon: 'ri-plane-line', color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Passaportes e roteiros' },
                { id: 'health', label: 'Saúde', icon: 'ri-heart-pulse-line', color: 'text-red-500', bg: 'bg-red-50', desc: 'Dados médicos e seguro' },
                { id: 'documents', label: 'Documentos', icon: 'ri-file-user-line', color: 'text-green-500', bg: 'bg-green-50', desc: 'Docs digitalizados' },
                { id: 'gamification', label: 'Conquistas', icon: 'ri-trophy-line', color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Nível e medalhas' },
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

            <div className="flex-1 max-w-7xl mx-auto w-full p-0 md:p-6 lg:p-8">
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
                                                className={`w-full flex items-center gap-4 p-3 md:p-3 rounded-2xl transition-all duration-200 group text-left ${activeTab === item.id
                                                    ? 'bg-white shadow-sm shadow-gray-200 translate-x-1 ring-1 ring-gray-100'
                                                    : 'hover:bg-white hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 md:w-10 md:h-10 rounded-2xl md:rounded-xl flex items-center justify-center transition-colors shrink-0 ${activeTab === item.id ? item.bg : 'bg-gray-50 group-hover:bg-gray-100'
                                                    }`}>
                                                    <i className={`${item.icon} text-2xl md:text-lg ${activeTab === item.id ? item.color : 'text-gray-500'
                                                        }`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className={`block font-bold text-base md:text-sm ${activeTab === item.id ? 'text-gray-900' : 'text-gray-700'
                                                        }`}>
                                                        {item.label}
                                                    </span>
                                                    <span className="block text-xs text-gray-400 truncate md:hidden lg:block">
                                                        {item.desc}
                                                    </span>
                                                </div>
                                                {activeTab === item.id && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 hidden md:block"></div>
                                                )}
                                                <i className="ri-arrow-right-s-line text-gray-300 md:hidden"></i>
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
        </div>
    );
}
