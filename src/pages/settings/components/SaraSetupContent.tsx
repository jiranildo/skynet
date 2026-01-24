import { useState, useEffect } from 'react';
import { User, updateUser, getTrips, getNotifications, supabase } from '@/services/supabase';

interface SaraSetupContentProps {
    userProfile?: User | null;
    onUpdate?: (user: User) => void;
}

export default function SaraSetupContent({ userProfile, onUpdate }: SaraSetupContentProps) {
    const [isActive, setIsActive] = useState(userProfile?.sara_enabled ?? true);
    const [lastCheck, setLastCheck] = useState('...');
    const [stats, setStats] = useState({ activeTrips: 0, sentAlerts: 0 });
    const [saving, setSaving] = useState(false);

    // Initial config state derived from profile
    const [config, setConfig] = useState(userProfile?.sara_config || {
        check_in_reminders: true,
        upcoming_activities: true,
        doc_expiration: true,
        weather_alerts: true,
        relevant_posts: true,
        post_suggestions: true,
        smart_suggestions: true,
        budget_alerts: true,
        itinerary_conflicts: true,
        custom_instructions: ''
    });

    // Update local state when profile changes
    useEffect(() => {
        if (userProfile) {
            setIsActive(userProfile.sara_enabled ?? true);
            if (userProfile.sara_config) {
                setConfig(userProfile.sara_config);
            }
        }
    }, [userProfile]);

    // Load Real Stats
    useEffect(() => {
        const loadStats = async () => {
            if (!userProfile?.id) return;
            try {
                const [trips, notes] = await Promise.all([
                    getTrips(userProfile.id),
                    getNotifications(userProfile.id)
                ]);

                // Active trips: end_date >= today
                const active = trips.filter((t: any) => new Date(t.end_date) >= new Date()).length;

                // Sent alerts: count notifications
                const alerts = notes.length;

                setStats({ activeTrips: active, sentAlerts: alerts });
                setLastCheck(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            } catch (error) {
                console.error("Error loading SARA stats:", error);
                setLastCheck('Error');
            }
        };

        loadStats();
    }, [userProfile?.id]);

    const handleConfigChange = async (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);

        // Auto-save logic
        if (userProfile && onUpdate) {
            try {
                await updateUser(userProfile.id, {
                    sara_config: newConfig
                });
                onUpdate({ ...userProfile, sara_config: newConfig });
            } catch (error) {
                console.error("Error saving SARA config:", error);
            }
        }
    };

    const handleToggleActive = async () => {
        const newState = !isActive;
        setIsActive(newState);
        if (userProfile && onUpdate) {
            try {
                await updateUser(userProfile.id, {
                    sara_enabled: newState
                });
                onUpdate({ ...userProfile, sara_enabled: newState });
            } catch (error) {
                console.error("Error toggling SARA:", error);
            }
        }
    };

    // Save instructions on blur or explicit save
    const handleSaveInstructions = async () => {
        setSaving(true);
        if (userProfile && onUpdate) {
            try {
                await updateUser(userProfile.id, {
                    sara_config: config
                });
                onUpdate({ ...userProfile, sara_config: config });
            } catch (error) {
                console.error("Error saving instructions:", error);
            }
        }
        setSaving(false);
    }

    const handleSendTestNotification = async () => {
        if (!userProfile?.id) return;

        try {
            await supabase.from('notifications').insert({
                user_id: userProfile.id,
                type: 'sara_alert',
                title: '⚡ Teste SARA',
                message: config.custom_instructions
                    ? `SARA conectada! Analisando suas preferências: "${config.custom_instructions.substring(0, 30)}..."`
                    : 'SARA está ativa e pronta para ajudar em suas viagens.',
                is_read: false
            });

            // Refresh stats relative to alerts
            setStats(prev => ({ ...prev, sentAlerts: prev.sentAlerts + 1 }));

            alert("Notificação de teste enviada com sucesso! Verifique o painel de notificações.");
        } catch (error) {
            console.error("Error sending test notification:", error);
            alert("Erro ao enviar notificação.");
        }
    };

    const sections = [
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
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 pb-24">

                {/* 1. Header Card */}
                <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-lg"></div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                            <i className="ri-magic-line text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">SARA Assistente</h2>
                            <p className="text-purple-100 text-sm">Configure sua assistente Inteligente</p>
                        </div>
                    </div>
                </div>

                {/* 2. Status & Toggle Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden -mt-12 relative z-20 mx-2 md:mx-4">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">STATUS DA SARA</span>
                            {isActive && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    Ativa
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            SARA está monitorando suas viagens e enviando notificações úteis.
                        </p>
                    </div>

                    <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-fuchsia-100 flex items-center justify-center shrink-0">
                                <i className="ri-flashlight-fill text-fuchsia-500 text-xl"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Ativar SARA</h3>
                                <p className="text-gray-500 text-sm">Assistente inteligente em background</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleActive}
                            className={`w-14 h-8 rounded-full transition-colors relative ${isActive ? 'bg-pink-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isActive ? 'translate-x-7' : 'translate-x-1'}`}></div>
                        </button>
                    </div>
                </div>

                {/* 3. Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 mb-1">{stats.activeTrips}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Roteiros Ativos</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 mb-1">{stats.sentAlerts}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Alertas Enviados</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-emerald-500 mb-1">{lastCheck}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Última Verificação</span>
                    </div>
                </div>

                {/* 4. Monitoring List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold">
                        <i className="ri-information-fill text-blue-500"></i>
                        <h3>O que SARA monitora</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            'Voos e hotéis não reservados quando viagem está próxima',
                            'Clima em tempo real e previsões',
                            'Notícias sobre voos e aeroportos',
                            'Lembretes 2h antes de cada atividade',
                            'Alertas de orçamento ultrapassado',
                            'Verificação automática de itinerários'
                        ].map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="mt-0.5 w-5 h-5 rounded-full border border-green-500 flex items-center justify-center shrink-0">
                                    <i className="ri-check-line text-green-500 text-sm font-bold"></i>
                                </div>
                                <span className="text-sm text-gray-600">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Detailed Configuration Sections */}
                <div className="pt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Configurações Avançadas</h4>

                    <div className="space-y-4">
                        {sections.map(section => (
                            <div key={section.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
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
                                                onClick={() => handleConfigChange(item.key, !config[item.key as keyof typeof config])}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${config[item.key as keyof typeof config] ? 'bg-pink-500' : 'bg-gray-200'}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${config[item.key as keyof typeof config] ? 'left-6.5' : 'left-0.5'}`}></div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Custom Instructions & Testing */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <i className="ri-robot-2-line text-indigo-500 text-lg"></i>
                        <div>
                            <h3 className="font-bold text-gray-900">Personalidade & Instruções</h3>
                            <p className="text-xs text-gray-500">Defina como SARA deve se comportar</p>
                        </div>
                    </div>

                    <textarea
                        value={config.custom_instructions}
                        onChange={(e) => handleConfigChange('custom_instructions', e.target.value)}
                        onBlur={handleSaveInstructions}
                        placeholder="Ex: Você é SARA, uma assistente focada em viagens de luxo e gastronomia..."
                        className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-mono leading-relaxed resize-none mb-4"
                    ></textarea>

                    <button
                        onClick={handleSendTestNotification}
                        disabled={!userProfile}
                        className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <i className="ri-message-3-line"></i>
                        Enviar Notificação de Teste
                    </button>
                </div>

            </div>
        </div>
    );
}
