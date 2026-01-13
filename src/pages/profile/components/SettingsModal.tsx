import { useState, useRef, useEffect } from 'react';
import { supabase, updateUser, User as UserType } from '@/services/supabase';

interface SettingsModalProps {
    userProfile: UserType;
    onClose: () => void;
    onUpdate: (updatedUser: UserType) => void;
}

type SettingsTab = 'account' | 'privacy' | 'notifications' | 'sara' | 'app';


export function SettingsContent({ userProfile, onUpdate, onClose, isEmbedded = false }: SettingsModalProps & { isEmbedded?: boolean }) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Form State - Initialized from userProfile
    const [formData, setFormData] = useState<Partial<UserType>>({
        full_name: userProfile.full_name,
        username: userProfile.username, // Read-only typically, but editable in basic profile
        website: userProfile.website,
        location: userProfile.location,
        language: userProfile.language || 'Português (Brasil)',
        theme: userProfile.theme || 'light',
        privacy_setting: userProfile.privacy_setting || 'public',
        show_location: userProfile.show_location ?? true,
        show_followers: userProfile.show_followers ?? true,
        show_following: userProfile.show_following ?? true,
        allow_messages: userProfile.allow_messages ?? true,
        allow_tagging: userProfile.allow_tagging ?? true,
        email_notifications: userProfile.email_notifications ?? true,
        push_notifications: userProfile.push_notifications ?? true,
        notification_channels: userProfile.notification_channels || {
            likes: true,
            comments: true,
            new_followers: true,
            messages: true,
            trip_updates: true,
            marketing: false
        },
        sara_enabled: userProfile.sara_enabled ?? true,
        sara_config: userProfile.sara_config || {
            check_in_reminders: true,
            upcoming_activities: true,
            doc_expiration: true,
            weather_alerts: true,
            relevant_posts: true,
            post_suggestions: true,
            smart_suggestions: true,
            budget_alerts: true,
            itinerary_conflicts: true,
            custom_instructions: userProfile.sara_config?.custom_instructions || ''
        },
        app_config: userProfile.app_config || {
            sound_effects: true,
            autoplay: true,
            high_quality: true,
            data_saver: false
        }
    });

    const handleInputChange = (field: keyof UserType, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleNestedChange = (parent: 'notification_channels' | 'sara_config' | 'app_config', key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent] as any),
                [key]: value
            }
        }));
        setHasChanges(true);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const updated = await updateUser(userProfile.id, {
                ...formData
            });
            onUpdate(updated);
            setHasChanges(false);
            // Optional: Show success toast
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Erro ao salvar configurações.');
        } finally {
            setIsLoading(false);
        }
    };

    const TabButton = ({ id, label, icon }: { id: SettingsTab, label: string, icon: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-all relative ${activeTab === id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            <i className={`${icon} text-xl mb-1`}></i>
            <span className="text-[10px] sm:text-xs font-medium">{label}</span>
            {activeTab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
        </button>
    );


    return (
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${!isEmbedded ? 'max-w-2xl max-h-[90vh]' : 'h-full shadow-none rounded-none'} overflow-hidden flex flex-col animate-scaleUp`}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <i className="ri-settings-3-fill text-xl"></i>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900 leading-tight">Configurações</h2>
                        <p className="text-xs text-gray-500">Gerencie sua conta e preferências</p>
                    </div>
                </div>
                {!isEmbedded && onClose && (
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white">
                <TabButton id="account" label="Conta" icon="ri-user-line" />
                <TabButton id="privacy" label="Privacidade" icon="ri-shield-user-line" />
                <TabButton id="notifications" label="Notificações" icon="ri-notification-3-line" />
                <TabButton id="sara" label="SARA" icon="ri-magic-line" />
                <TabButton id="app" label="App" icon="ri-global-line" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30">
                <div className="p-6">
                    {activeTab === 'account' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Profile Info Section */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-user-settings-line text-blue-500 text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Informações da Conta</h3>
                                </div>
                                <p className="text-xs text-gray-500 -mt-2">Atualize seus dados pessoais</p>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={formData.full_name || ''}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={userProfile?.username || 'jimatos@yahoo.com'}
                                        disabled
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 outline-none cursor-not-allowed text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">O email não pode ser alterado</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Localização</label>
                                    <input
                                        type="text"
                                        value={formData.location || ''}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="São Paulo, Brasil"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Website</label>
                                    <input
                                        type="text"
                                        value={formData.website || ''}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Idioma</label>
                                    <select
                                        value={formData.language}
                                        onChange={(e) => handleInputChange('language', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm appearance-none"
                                    >
                                        <option value="Português (Brasil)">Português (Brasil)</option>
                                        <option value="English (US)">English (US)</option>
                                        <option value="Español">Español</option>
                                    </select>
                                </div>


                            </div>

                            {/* Security Section */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-key-2-line text-orange-500 text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Segurança</h3>
                                </div>
                                <p className="text-xs text-gray-500 -mt-2">Gerencie senha e segurança</p>

                                <div className="space-y-2">
                                    <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                <i className="ri-lock-password-line"></i>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Alterar Senha</span>
                                        </div>
                                        <i className="ri-arrow-right-s-line text-gray-400"></i>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                <i className="ri-smartphone-line"></i>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Autenticação em Dois Fatores</span>
                                        </div>
                                        <i className="ri-arrow-right-s-line text-gray-400"></i>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                <i className="ri-macbook-line"></i>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Sessões Ativas</span>
                                        </div>
                                        <i className="ri-arrow-right-s-line text-gray-400"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <i className="ri-alarm-warning-line text-red-500 text-lg"></i>
                                        <div>
                                            <h3 className="font-bold text-red-700">Zona de Perigo</h3>
                                            <p className="text-xs text-red-500">Ações irreversíveis</p>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                    <i className="ri-delete-bin-line"></i> Excluir Conta
                                </button>
                                <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <i className="ri-logout-box-r-line"></i> Sair da Conta
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Privacy Settings */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-shield-check-line text-purple-500 text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Privacidade do Perfil</h3>
                                </div>
                                <p className="text-xs text-gray-500 -mt-6 ml-8">Controle quem pode ver suas informações</p>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Visibilidade do Perfil</label>
                                    <select
                                        value={formData.privacy_setting}
                                        onChange={(e) => handleInputChange('privacy_setting', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm appearance-none"
                                    >
                                        <option value="public">Público</option>
                                        <option value="private">Privado</option>
                                        <option value="friends">Amigos</option>
                                    </select>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Mostrar Localização</h4>
                                            <p className="text-xs text-gray-500">Exibir localização no perfil</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('show_location', !formData.show_location)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.show_location ? 'bg-purple-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.show_location ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Mostrar Seguidores</h4>
                                            <p className="text-xs text-gray-500">Exibir lista de seguidores</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('show_followers', !formData.show_followers)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.show_followers ? 'bg-purple-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.show_followers ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Mostrar Seguindo</h4>
                                            <p className="text-xs text-gray-500">Exibir quem você segue</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('show_following', !formData.show_following)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.show_following ? 'bg-purple-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.show_following ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Interactions Section */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-message-3-line text-blue-500 text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Interações</h3>
                                </div>
                                <p className="text-xs text-gray-500 -mt-6 ml-8">Controle como outros interagem com você</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Permitir Mensagens</h4>
                                            <p className="text-xs text-gray-500">Receber mensagens diretas</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('allow_messages', !formData.allow_messages)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.allow_messages ? 'bg-blue-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.allow_messages ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Permitir Marcações</h4>
                                            <p className="text-xs text-gray-500">Ser marcado em posts e fotos</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('allow_tagging', !formData.allow_tagging)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.allow_tagging ? 'bg-blue-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.allow_tagging ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Channels */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-notification-badge-line text-green-500 text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Canais de Notificação</h3>
                                </div>
                                <p className="text-xs text-gray-500 -mt-6 ml-8">Escolha como receber notificações</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Notificações por Email</h4>
                                            <p className="text-xs text-gray-500">Receber emails de notificação</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('email_notifications', !formData.email_notifications)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.email_notifications ? 'bg-green-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.email_notifications ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Notificações Push</h4>
                                            <p className="text-xs text-gray-500">Notificações no dispositivo</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('push_notifications', !formData.push_notifications)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.push_notifications ? 'bg-green-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.push_notifications ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Social Activity */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-group-line text-purple-500 text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Atividades Sociais</h3>
                                </div>
                                <p className="text-xs text-gray-500 -mt-6 ml-8">Notificações de interações</p>

                                <div className="space-y-4">
                                    {['likes', 'comments', 'new_followers', 'messages'].map((key) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800">
                                                    {key === 'likes' && 'Curtidas'}
                                                    {key === 'comments' && 'Comentários'}
                                                    {key === 'new_followers' && 'Novos Seguidores'}
                                                    {key === 'messages' && 'Mensagens'}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {key === 'likes' && 'Quando alguém curte seu post'}
                                                    {key === 'comments' && 'Quando alguém comenta'}
                                                    {key === 'new_followers' && 'Quando alguém te segue'}
                                                    {key === 'messages' && 'Novas mensagens diretas'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleNestedChange('notification_channels', key, !(formData.notification_channels as any)[key])}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${formData.notification_channels?.[key as keyof typeof formData.notification_channels] ? 'bg-purple-500' : 'bg-gray-200'}`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.notification_channels?.[key as keyof typeof formData.notification_channels] ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trip Updates */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-map-pin-user-line text-blue-500 text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Viagens</h3>
                                </div>
                                <p className="text-xs text-gray-500 -mt-6 ml-8">Atualizações de roteiros</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Atualizações de Viagem</h4>
                                            <p className="text-xs text-gray-500">Mudanças em roteiros compartilhados</p>
                                        </div>
                                        <button
                                            onClick={() => handleNestedChange('notification_channels', 'trip_updates', !formData.notification_channels?.trip_updates)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.notification_channels?.trip_updates ? 'bg-blue-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.notification_channels?.trip_updates ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Marketing</h4>
                                            <p className="text-xs text-gray-500">Promoções e novidades</p>
                                        </div>
                                        <button
                                            onClick={() => handleNestedChange('notification_channels', 'marketing', !formData.notification_channels?.marketing)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.notification_channels?.marketing ? 'bg-blue-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.notification_channels?.marketing ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sara' && (
                        <div className="space-y-6 animate-fadeIn pb-12">
                            {/* Sara Content... reused from before */}
                            {/* Header / Activation */}
                            <div className="rounded-2xl overflow-hidden shadow-lg relative">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white pb-12">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <i className="ri-magic-line text-2xl"></i>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">SARA Assistente</h2>
                                            <p className="opacity-90 text-xs">Configure sua assistente Inteligente</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 pt-12 relative">
                                    <div className="absolute -top-8 left-5 right-5 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Status da SARA</p>
                                            <p className="text-gray-700 text-xs leading-tight">SARA está monitorando suas viagens e enviando notificações úteis</p>
                                        </div>
                                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Ativa</div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                                <i className="ri-flashlight-line"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Ativar SARA</h4>
                                                <p className="text-xs text-gray-500">Assistente inteligente em background</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('sara_enabled', !formData.sara_enabled)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.sara_enabled ? 'bg-pink-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.sara_enabled ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Component */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                                    <div className="text-2xl font-bold text-gray-900">0</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Roteiros Ativos</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                                    <div className="text-2xl font-bold text-gray-900">0</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Alertas Enviados</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                                    <div className="text-lg font-bold text-green-600">13:10</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Última Verificação</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2 mb-3">
                                    <i className="ri-information-line text-blue-500"></i>
                                    O que SARA monitora
                                </h4>
                                <div className="space-y-2">
                                    {['Voos e hotéis não reservados quando viagem está próxima', 'Clima em tempo real e previsões', 'Notícias sobre voos e aeroportos', 'Lembretes 2h antes de cada atividade', 'Alertas de orçamento ultrapassado', 'Verificação automática a cada 15 minutos'].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                            <i className="ri-checkbox-circle-line text-green-500 mt-0.5"></i>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sections */}
                            {[
                                {
                                    id: 'travel_alerts', title: 'Alertas de Viagem', icon: 'ri-calendar-event-line', color: 'text-blue-500',
                                    items: [
                                        { key: 'check_in_reminders', label: 'Lembretes de Check-in', sub: 'Voos e hotéis (24h antes)' },
                                        { key: 'upcoming_activities', label: 'Próximas Atividades', sub: 'Alertas 1h antes do horário' },
                                        { key: 'doc_expiration', label: 'Documentos', sub: 'Alertas de expiração e requisitos' },
                                        { key: 'weather_alerts', label: 'Clima e Avisos', sub: 'Condições adversas no destino' }
                                    ]
                                },
                                {
                                    id: 'social', title: 'Social & Comunidade', icon: 'ri-group-line', color: 'text-purple-500',
                                    items: [
                                        { key: 'relevant_posts', label: 'Posts Relevantes', sub: 'Notificar sobre posts de destinos similares' },
                                        { key: 'post_suggestions', label: 'Sugestões de Posts', sub: 'Ideias de conteúdo baseado nas viagens' }
                                    ]
                                },
                                {
                                    id: 'opportunities', title: 'Oportunidades', icon: 'ri-line-chart-line', color: 'text-green-500',
                                    items: [
                                        { key: 'smart_suggestions', label: 'Sugestões Inteligentes', sub: 'Lugares e atividades próximas' },
                                        { key: 'budget_alerts', label: 'Alertas de Orçamento', sub: 'Avisos quando próximo do limite' }
                                    ]
                                },
                                {
                                    id: 'risk', title: 'Alertas de Risco', icon: 'ri-shield-flash-line', color: 'text-red-500',
                                    items: [
                                        { key: 'itinerary_conflicts', label: 'Conflitos no Roteiro', sub: 'Atividades muito próximas ou impossíveis' }
                                    ]
                                }
                            ].map(section => (
                                <div key={section.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <i className={`${section.icon} ${section.color} text-lg`}></i>
                                        <h3 className="font-bold text-gray-900">{section.title}</h3>
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                        {section.items.map(item => (
                                            <div key={item.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-800">{item.label}</h4>
                                                    <p className="text-xs text-gray-500">{item.sub}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleNestedChange('sara_config', item.key, !(formData.sara_config as any)[item.key])}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.sara_config?.[item.key as keyof typeof formData.sara_config] ? 'bg-pink-500' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.sara_config?.[item.key as keyof typeof formData.sara_config] ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button className="w-full py-4 bg-gray-50 rounded-xl border border-gray-100 text-purple-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
                                <i className="ri-message-3-line"></i> Testar SARA (Enviar Notificação de Teste)
                            </button>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-robot-2-line text-indigo-500 text-lg"></i>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Personalidade & Instruções</h3>
                                        <p className="text-xs text-gray-500">Defina como SARA deve se comportar</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Prompt do Sistema (Instruções)</label>
                                    <textarea
                                        value={formData.sara_config?.custom_instructions || ''}
                                        onChange={(e) => handleNestedChange('sara_config', 'custom_instructions', e.target.value)}
                                        placeholder="Você é SARA, uma assistente de viagens..."
                                        className="w-full h-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-xs font-mono leading-relaxed resize-none"
                                    ></textarea>
                                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                        <i className="ri-information-line"></i>
                                        Use este espaço para colar as definições de comportamento, objetivos e notificações da SARA.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'app' && (
                        <div className="space-y-6 animate-fadeIn pb-8">
                            {/* Appearance */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-sun-line text-orange-400 text-lg"></i>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Aparência</h3>
                                        <p className="text-xs text-gray-500">Personalize a interface</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Tema</label>
                                    <div className="relative">
                                        <select
                                            value={formData.theme}
                                            onChange={(e) => handleInputChange('theme', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="light">Claro</option>
                                            <option value="dark">Escuro</option>
                                            <option value="system">Sistema</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <i className="ri-arrow-down-s-line"></i>
                                        </div>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                            {formData.theme === 'light' && <i className="ri-sun-line"></i>}
                                            {formData.theme === 'dark' && <i className="ri-moon-line"></i>}
                                            {formData.theme === 'system' && <i className="ri-computer-line"></i>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Media */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-volume-up-line text-green-500 text-lg"></i>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Mídia</h3>
                                        <p className="text-xs text-gray-500">Som e reprodução</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Efeitos Sonoros</h4>
                                            <p className="text-xs text-gray-500">Sons de notificação e ações</p>
                                        </div>
                                        <button
                                            onClick={() => handleNestedChange('app_config', 'sound_effects', !formData.app_config?.sound_effects)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.app_config?.sound_effects ? 'bg-green-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.app_config?.sound_effects ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Reprodução Automática</h4>
                                            <p className="text-xs text-gray-500">Vídeos no feed</p>
                                        </div>
                                        <button
                                            onClick={() => handleNestedChange('app_config', 'autoplay', !formData.app_config?.autoplay)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.app_config?.autoplay ? 'bg-green-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.app_config?.autoplay ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">Alta Qualidade</h4>
                                            <p className="text-xs text-gray-500">Upload de imagens HD</p>
                                        </div>
                                        <button
                                            onClick={() => handleNestedChange('app_config', 'high_quality', !formData.app_config?.high_quality)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.app_config?.high_quality ? 'bg-green-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.app_config?.high_quality ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Data */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-smartphone-line text-blue-500 text-lg"></i>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Dados</h3>
                                        <p className="text-xs text-gray-500">Uso de dados móveis</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">Economia de Dados</h4>
                                        <p className="text-xs text-gray-500">Reduzir uso em 4G/5G</p>
                                    </div>
                                    <button
                                        onClick={() => handleNestedChange('app_config', 'data_saver', !formData.app_config?.data_saver)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.app_config?.data_saver ? 'bg-blue-500' : 'bg-gray-200'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.app_config?.data_saver ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Support */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="ri-question-line text-gray-600 text-lg"></i>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Suporte</h3>
                                        <p className="text-xs text-gray-500">Ajuda e informações</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { label: 'Central de Ajuda', icon: 'ri-question-line' },
                                        { label: 'Sobre o Travel Experience', icon: 'ri-information-line' },
                                        { label: 'Política de Privacidade', icon: 'ri-shield-check-line' },
                                        { label: 'Termos de Uso', icon: 'ri-file-text-line' }
                                    ].map((item, index) => (
                                        <button key={index} className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    <i className={item.icon}></i>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                            </div>
                                            <i className="ri-arrow-right-s-line text-gray-400"></i>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center py-6 text-gray-400">
                                <h4 className="font-serif italic text-gray-600 mb-1">Travel Experience</h4>
                                <p className="text-[10px] uppercase font-bold tracking-wider mb-2">Versão 1.0.0</p>
                                <p className="text-[10px]">© 2024 Todos os direitos reservados</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Sticky Action Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3 z-10 relative">
                {!isEmbedded && onClose && (
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !hasChanges}
                    className={`px-8 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98] ${hasChanges ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    {isLoading ? <i className="ri-loader-4-line animate-spin"></i> : 'Salvar Alterações'}
                </button>
            </div>
        </div >
    );
}

export default function SettingsModal(props: SettingsModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <SettingsContent {...props} />
        </div>
    );
}
