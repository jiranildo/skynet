import { useState } from 'react';
import { User as UserType } from '@/services/supabase';
import { EditProfileContent } from './EditProfileModal';
import { SettingsContent } from './SettingsModal';
import WalletWidget from '@/components/WalletWidget';
import GamificationWidget from '@/components/GamificationWidget';

interface ProfileHubModalProps {
    userProfile: UserType;
    onClose: () => void;
    onUpdate: (updatedUser: UserType) => void;
    initialTab?: 'edit' | 'settings' | 'wallet' | 'gamification';
}

export default function ProfileHubModal({ userProfile, onClose, onUpdate, initialTab = 'edit' }: ProfileHubModalProps) {
    const [activeTab, setActiveTab] = useState<'edit' | 'settings' | 'wallet' | 'gamification'>(initialTab);

    const menuItems = [
        { id: 'edit', label: 'Editar Perfil', icon: 'ri-user-edit-line', color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'settings', label: 'Configurações', icon: 'ri-settings-3-line', color: 'text-gray-500', bg: 'bg-gray-50' },
        { id: 'wallet', label: 'Carteira', icon: 'ri-wallet-3-line', color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { id: 'gamification', label: 'Conquistas', icon: 'ri-trophy-line', color: 'text-purple-500', bg: 'bg-purple-50' },
    ] as const;

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col md:flex-row animate-scaleUp">

                {/* Sidebar */}
                <div className="w-full md:w-72 bg-gray-50/80 border-r border-gray-100 flex flex-col">
                    <div className="p-6 pb-2">
                        <h2 className="font-bold text-xl text-gray-900">Meu Espaço</h2>
                        <p className="text-xs text-gray-500">Gerencie sua conta e atividades</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                        ? 'bg-white shadow-md shadow-gray-100 scale-[1.02]'
                                        : 'hover:bg-white/60 hover:shadow-sm'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${activeTab === item.id ? item.bg : 'bg-transparent group-hover:bg-gray-100'
                                    }`}>
                                    <i className={`${item.icon} text-xl ${activeTab === item.id ? item.color : 'text-gray-500'
                                        }`}></i>
                                </div>
                                <div className="text-left">
                                    <span className={`block font-bold text-sm ${activeTab === item.id ? 'text-gray-900' : 'text-gray-600'
                                        }`}>
                                        {item.label}
                                    </span>
                                </div>
                                {activeTab === item.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-200/50">
                        <button
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm font-medium"
                        >
                            <i className="ri-arrow-left-line"></i>
                            Voltar para o App
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
                    {/* Mobile Header (only visible on small screens) */}
                    <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'edit' && (
                            <div className="h-full overflow-y-auto">
                                <div className="max-w-2xl mx-auto p-6">
                                    <EditProfileContent
                                        userProfile={userProfile}
                                        onUpdate={onUpdate}
                                        isEmbedded={true}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <SettingsContent
                                userProfile={userProfile}
                                onUpdate={onUpdate}
                                onClose={() => { }} // Not needed when embedded
                                isEmbedded={true}
                            />
                        )}

                        {activeTab === 'wallet' && (
                            <div className="h-full">
                                <WalletWidget onClose={() => { }} /> {/* Pass empty onClose to hide close button in widget header if widget supports it */}
                            </div>
                        )}

                        {activeTab === 'gamification' && (
                            <div className="h-full">
                                <GamificationWidget onClose={() => { }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
