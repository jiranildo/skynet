import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CreateTripForm from '../travel/components/CreateTripForm';
import ManagedTrips from './components/ManagedTrips';
import AgentStats from './components/AgentStats';
import AgentInBox from './components/AgentInBox';
import InfoWidgets from './components/InfoWidgets';

export type AgentTab = 'overview' | 'messages' | 'creator' | 'trips';

import Header from '../../components/layout/Header';
import NotificationsPanel from '../home/components/NotificationsPanel';

export default function AgentDashboard() {
    const { user, loading, hasPermission } = useAuth();
    const [isAgent, setIsAgent] = useState<boolean | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as AgentTab) || 'trips';
    const navigate = useNavigate();

    const setActiveTab = (tab: AgentTab) => {
        setSearchParams({ tab });
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login');
                return;
            }

            const allowed = hasPermission('can_access_agent_portal');
            setIsAgent(allowed);

            if (!allowed) {
                navigate('/');
            }
        }
    }, [user, loading, navigate, hasPermission]);

    if (loading || isAgent === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAgent) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header onShowNotifications={() => setShowNotifications(!showNotifications)} />
            {showNotifications && (
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}
            
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-32 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
                    <div className="border-l-4 border-blue-600 pl-4">
                        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">Painel do Agente</h2>
                        <p className="text-gray-500 font-medium mt-1">Gerencie e monetize suas experiências.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                            <button
                                onClick={() => setActiveTab('trips')}
                                title="Experiências"
                                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                                    activeTab === 'trips' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <i className="ri-suitcase-2-line text-xl"></i>
                            </button>
                            <button
                                onClick={() => setActiveTab('overview')}
                                title="Dashboard"
                                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                                    activeTab === 'overview' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <i className="ri-dashboard-line text-xl"></i>
                            </button>
                            <button
                                onClick={() => setActiveTab('messages')}
                                title="Mensagens"
                                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                                    activeTab === 'messages' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <i className="ri-message-3-line text-xl"></i>
                            </button>
                        </div>

                        <button
                            onClick={() => setActiveTab('creator')}
                            title="Criar Experiência"
                            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow hover:shadow-lg transition-all"
                        >
                            <i className="ri-add-line text-xl"></i>
                        </button>
                    </div>
                </div>

                <header className="mb-4">
                {/* Widgets */}
                <div className="flex flex-col gap-4">
                    <div className="w-full overflow-x-auto no-scrollbar pb-2">
                        <InfoWidgets />
                    </div>
                </div>
            </header>

            <main>
                {activeTab === 'overview' && <AgentStats />}
                {activeTab === 'messages' && <AgentInBox />}
                {activeTab === 'creator' && (
                    <CreateTripForm
                        onCancel={() => setActiveTab('overview')}
                        onSuccess={() => {
                            setActiveTab('trips');
                        }}
                    />
                )}
                {activeTab === 'trips' && <ManagedTrips />}
            </main>
        </div>
        </div>
    );
}
