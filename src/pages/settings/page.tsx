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

export default function SettingsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user: authUser, loading: authLoading } = useAuth();

    // Get active tab from URL or default to 'edit'
    const activeTab = searchParams.get('tab') || 'edit';

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

    const menuItems = [
        { id: 'edit', label: 'Editar Perfil', icon: 'ri-user-edit-line', color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'settings', label: 'Configurações', icon: 'ri-settings-3-line', color: 'text-gray-500', bg: 'bg-gray-50' },
        { id: 'wallet', label: 'Carteira', icon: 'ri-wallet-3-line', color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { id: 'gamification', label: 'Conquistas', icon: 'ri-trophy-line', color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'documents', label: 'Documentos', icon: 'ri-file-user-line', color: 'text-green-500', bg: 'bg-green-50' },
        { id: 'travel', label: 'Viagem', icon: 'ri-plane-line', color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'health', label: 'Saúde', icon: 'ri-heart-pulse-line', color: 'text-red-500', bg: 'bg-red-50' },
    ] as const;

    if (isLoading || !userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Back Button for Mobile */}
            <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                <button onClick={() => navigate('/profile')} className="p-2 -ml-2 text-gray-600">
                    <i className="ri-arrow-left-line text-xl"></i>
                </button>
                <h1 className="font-bold text-lg text-gray-900">
                    {menuItems.find(i => i.id === activeTab)?.label}
                </h1>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full p-0 md:p-6 lg:p-8">
                <div className="bg-white md:rounded-3xl shadow-sm md:shadow-xl w-full min-h-[calc(100vh-theme(spacing.16))] md:min-h-[80vh] overflow-hidden flex flex-col md:flex-row border border-gray-100">

                    {/* Sidebar */}
                    <div className="hidden md:flex w-72 bg-gray-50/50 border-r border-gray-100 flex-col">
                        <div className="p-8 pb-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 text-sm font-medium"
                            >
                                <i className="ri-arrow-left-line"></i>
                                Voltar ao Perfil
                            </button>
                            <h2 className="font-bold text-2xl text-gray-900">Meu Espaço</h2>
                            <p className="text-sm text-gray-500 mt-1">Gerencie sua conta</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group ${activeTab === item.id
                                        ? 'bg-white shadow-md shadow-gray-100/50 translate-x-1'
                                        : 'hover:bg-white/60 hover:shadow-sm'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === item.id ? item.bg : 'bg-transparent group-hover:bg-gray-100'
                                        }`}>
                                        <i className={`${item.icon} text-xl ${activeTab === item.id ? item.color : 'text-gray-500'
                                            }`}></i>
                                    </div>
                                    <div className="text-left flex-1">
                                        <span className={`block font-bold text-sm ${activeTab === item.id ? 'text-gray-900' : 'text-gray-600'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {activeTab === item.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 text-center text-xs text-gray-400">
                            SocialHub v1.0.0
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white relative flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'edit' && (
                                <div className="max-w-3xl mx-auto p-4 md:p-10">
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

                        {/* Mobile Bottom Nav for Hub */}
                        <div className="md:hidden bg-white border-t border-gray-100 p-2 flex justify-around items-center pb-safe">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'
                                        }`}
                                >
                                    <i className={`${item.icon} text-xl mb-1`}></i>
                                    <span className="text-[10px] font-bold">{item.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
